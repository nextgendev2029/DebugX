from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime

from app.utils.database import get_db
from app.routes.users import verify_firebase_token
from app.models.models import Problem, Submission, SubmissionStatus, AIFeedback, UserProgress
from app.schemas.schemas import SubmissionCreate, SubmissionOut, AIFeedbackOut, TestCaseResult
from app.utils.code_runner import run_code_against_tests
from app.utils.gemini import get_hint

router = APIRouter()


# ─── POST /api/submissions ───────────────────────────────────────────────────

@router.post("", response_model=SubmissionOut, summary="Submit Code")
def submit_code(
    body: SubmissionCreate,
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    """
    Submit code for a problem.
    Runs the code against hidden test cases, returns results + AI hint if wrong.
    """
    # 1. Get the user from Firebase UID
    from app.models.models import User
    uid = decoded_token.get("uid") or decoded_token.get("user_id")
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please sync your account first.")

    # 2. Get the problem
    problem = db.query(Problem).filter(Problem.id == body.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # 3. Create submission record (PENDING)
    submission = Submission(
        user_id=user.id,
        problem_id=problem.id,
        code=body.code,
        language=body.language,
        status=SubmissionStatus.PENDING,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # 4. Run code against test cases
    test_cases = problem.test_cases or []
    if not test_cases:
        raise HTTPException(status_code=400, detail="This problem has no test cases configured")

    run_result = run_code_against_tests(
        user_code=body.code,
        test_cases=test_cases,
        language=body.language,
    )

    # 5. Map status string to enum
    status_map = {
        "accepted": SubmissionStatus.ACCEPTED,
        "wrong_answer": SubmissionStatus.WRONG_ANSWER,
        "runtime_error": SubmissionStatus.RUNTIME_ERROR,
        "compile_error": SubmissionStatus.COMPILE_ERROR,
        "time_limit_exceeded": SubmissionStatus.TIME_LIMIT_EXCEEDED,
    }
    submission.status = status_map.get(run_result["status"], SubmissionStatus.WRONG_ANSWER)
    submission.passed_tests = run_result["passed_tests"]
    submission.total_tests = run_result["total_tests"]
    submission.score = run_result["score"]
    submission.execution_time = run_result["execution_time_ms"]
    submission.error_message = run_result["error_message"]
    submission.test_results = run_result["test_results"]

    db.commit()
    db.refresh(submission)

    # 6. Update user progress
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == user.id,
        UserProgress.problem_id == problem.id,
    ).first()

    if not progress:
        progress = UserProgress(
            user_id=user.id,
            problem_id=problem.id,
        )
        db.add(progress)

    progress.attempts = (progress.attempts or 0) + 1
    progress.last_attempted_at = datetime.utcnow()

    if submission.score > (progress.best_score or 0):
        progress.best_score = submission.score

    if submission.status == SubmissionStatus.ACCEPTED and not progress.is_solved:
        progress.is_solved = True
        progress.solved_at = datetime.utcnow()
        # Update user stats
        user.problems_solved = (user.problems_solved or 0) + 1
        user.total_score = (user.total_score or 0) + 10  # 10 points per problem

    # Update problem stats
    problem.total_attempts = (problem.total_attempts or 0) + 1
    if submission.status == SubmissionStatus.ACCEPTED:
        problem.total_solved = (problem.total_solved or 0) + 1
    if problem.total_attempts > 0:
        problem.success_rate = int((problem.total_solved or 0) / problem.total_attempts * 100)

    db.commit()

    # 7. Generate AI feedback if not fully accepted
    feedback_data = None
    if submission.status != SubmissionStatus.ACCEPTED:
        # Send full failed test details to Gemini (input + expected + actual)
        # so it can compare outputs and find the exact bug
        failed_test_details = [
            {
                "input": tr["input"],
                "expected": tr["expected"],
                "actual": tr["actual"] or "(no output)",
            }
            for tr in run_result["test_results"] if not tr["passed"]
        ]

        hint = get_hint(
            problem_title=problem.title,
            problem_description=problem.description,
            user_code=body.code,
            passed_tests=run_result["passed_tests"],
            total_tests=run_result["total_tests"],
            failed_test_details=failed_test_details,
            error_message=run_result["error_message"],
        )

        ai_feedback = AIFeedback(
            submission_id=submission.id,
            feedback_text=hint["feedback_text"],
            suggestions=hint["suggestions"],
        )
        db.add(ai_feedback)
        db.commit()
        db.refresh(ai_feedback)

        feedback_data = AIFeedbackOut(
            feedback_text=ai_feedback.feedback_text,
            suggestions=ai_feedback.suggestions,
        )

    # 8. Build response — allow viewing full test results
    sanitized_results = []
    for tr in run_result["test_results"]:
        sanitized_results.append(TestCaseResult(
            test_number=tr["test_number"],
            input=tr["input"],
            expected=tr["expected"],
            actual=tr["actual"] or "(no output)",
            passed=tr["passed"],
            error=tr.get("error"),
        ))

    return SubmissionOut(
        id=submission.id,
        problem_id=submission.problem_id,
        problem_title=problem.title,
        status=submission.status.value,
        code=submission.code,
        language=submission.language,
        passed_tests=submission.passed_tests,
        total_tests=submission.total_tests,
        score=submission.score,
        execution_time=submission.execution_time,
        error_message=submission.error_message,
        test_results=sanitized_results,
        feedback=feedback_data,
        created_at=submission.created_at,
    )


@router.get("/heatmap", summary="Get User Heatmap")
def get_user_heatmap(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    """
    Return per-day submission counts for the last 365 days + streak stats.
    """
    from datetime import date, timedelta
    from collections import defaultdict
    from app.models.models import User

    uid = decoded_token.get("uid") or decoded_token.get("user_id")
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    today = date.today()
    one_year_ago = today - timedelta(days=364)

    # Get all user submissions in the last year
    subs = (
        db.query(Submission.created_at)
        .filter(
            Submission.user_id == user.id,
            Submission.created_at >= datetime.combine(one_year_ago, datetime.min.time())
        )
        .all()
    )

    activity = defaultdict(int)
    for (created_at,) in subs:
        day_key = created_at.date().isoformat()
        activity[day_key] += 1

    # Current streak calculation (backwards from today)
    current_streak = 0
    check_day = today
    
    # If no activity today, check yesterday for streak continuity
    if today.isoformat() not in activity:
        check_day = today - timedelta(days=1)
        
    while check_day.isoformat() in activity:
        current_streak += 1
        check_day -= timedelta(days=1)

    # Longest streak in the window
    longest_streak, run = 0, 0
    for i in range(364, -1, -1):
        d = (today - timedelta(days=i)).isoformat()
        if d in activity:
            run += 1
            longest_streak = max(longest_streak, run)
        else:
            run = 0

    return {
        "activity": dict(activity),
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_submissions": sum(activity.values()),
        "active_days": len(activity),
        "today": today.isoformat(),
    }


@router.get("/stats", summary="Get User Stats")
def get_user_stats(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    """
    Return total solved, success rate, current streak, and total points.
    """
    from app.models.models import User, Submission
    uid = decoded_token.get("uid") or decoded_token.get("user_id")
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        return {
            "total_solved": 0,
            "success_rate": 0,
            "current_streak": 0,
            "total_score": 0,
        }

    # Success rate calculation
    total_attempts = db.query(Submission).filter(Submission.user_id == user.id).count()
    total_solved = user.problems_solved or 0
    success_rate = int((total_solved / total_attempts * 100)) if total_attempts > 0 else 0

    return {
        "total_solved": total_solved,
        "success_rate": success_rate,
        "current_streak": user.current_streak or 0,
        "total_score": user.total_score or 0,
    }

@router.get("/mine", summary="Get Current User's Submissions")
def get_my_submissions(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    """
    Return all submissions for the currently authenticated user.
    """
    from app.models.models import User
    uid = decoded_token.get("uid") or decoded_token.get("user_id")
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        return []
    
    subs = db.query(Submission).filter(Submission.user_id == user.id).order_by(Submission.created_at.desc()).all()
    
    # We can reuse the schema conversion logic if needed, but for simplicity returning dicts
    return [
        {
            "id": s.id,
            "problem_id": s.problem_id,
            "problem_title": s.problem.title,
            "status": s.status.value if hasattr(s.status, 'value') else s.status,
            "code": s.code,
            "language": s.language,
            "passed_tests": s.passed_tests,
            "total_tests": s.total_tests,
            "score": s.score,
            "execution_time": s.execution_time,
            "created_at": s.created_at.isoformat(),
        }
        for s in subs
    ]

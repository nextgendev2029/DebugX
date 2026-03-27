from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


# ─── Problem Schemas ──────────────────────────────────────────────────────────

class ProblemListOut(BaseModel):
    """Lightweight problem info for the list page — no test cases, no full description."""
    id: int
    title: str
    slug: str
    difficulty: str
    topic: str
    tags: Optional[List[str]] = None
    success_rate: int = 0
    total_attempts: int = 0
    total_solved: int = 0

    class Config:
        from_attributes = True


class ProblemOut(BaseModel):
    """Full problem detail — includes description, examples, starter code, but NOT hidden test cases."""
    id: int
    title: str
    slug: str
    description: str
    difficulty: str
    topic: str
    tags: Optional[List[str]] = None
    examples: Optional[List[Any]] = None
    constraints: Optional[List[str]] = None
    starter_code: Optional[dict] = None
    success_rate: int = 0
    total_attempts: int = 0
    total_solved: int = 0

    class Config:
        from_attributes = True


# ─── Submission Schemas ───────────────────────────────────────────────────────

class SubmissionCreate(BaseModel):
    """Incoming code submission from the user."""
    problem_id: int
    code: str
    language: str = "python"


class TestCaseResult(BaseModel):
    """Result for a single test case."""
    test_number: int
    input: str
    expected: str
    actual: Optional[str] = None
    passed: bool
    error: Optional[str] = None


class AIFeedbackOut(BaseModel):
    """AI-generated hint without revealing the answer."""
    feedback_text: str
    suggestions: Optional[List[str]] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    username: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = None

class SubmissionOut(BaseModel):
    """Full submission result returned to the frontend."""
    id: int
    problem_id: int
    problem_title: Optional[str] = None
    status: str
    code: str
    language: str
    passed_tests: int
    total_tests: int
    score: int
    execution_time: Optional[int] = None
    error_message: Optional[str] = None
    test_results: Optional[List[TestCaseResult]] = None
    feedback: Optional[AIFeedbackOut] = None
    created_at: datetime

    class Config:
        from_attributes = True

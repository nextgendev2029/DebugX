from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.utils.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"


class DifficultyLevel(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class SubmissionStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    ACCEPTED = "accepted"
    WRONG_ANSWER = "wrong_answer"
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
    RUNTIME_ERROR = "runtime_error"
    COMPILE_ERROR = "compile_error"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String(128), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100))
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    
    # Profile information
    bio = Column(Text)
    avatar_url = Column(String(500))
    
    # Statistics
    total_score = Column(Integer, default=0)
    problems_solved = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime)
    
    # Relationships
    submissions = relationship("Submission", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.username}>"


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False, index=True)
    
    # Progress tracking
    is_solved = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
    best_score = Column(Integer, default=0)
    
    # Timestamps
    first_attempted_at = Column(DateTime, default=datetime.utcnow)
    last_attempted_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    solved_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="progress")

    def __repr__(self):
        return f"<UserProgress User:{self.user_id} Problem:{self.problem_id}>"


class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    
    # Difficulty and categorization
    difficulty = Column(SQLEnum(DifficultyLevel), nullable=False, index=True)
    topic = Column(String(100), nullable=False, index=True)
    tags = Column(JSON)  # List of tags
    
    # Problem content
    examples = Column(JSON)  # List of example inputs/outputs
    constraints = Column(JSON)  # List of constraints
    starter_code = Column(JSON)  # Dict with language as key, code as value
    test_cases = Column(JSON)  # List of test cases
    
    # Metadata
    success_rate = Column(Integer, default=0)  # Percentage
    total_attempts = Column(Integer, default=0)
    total_solved = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    submissions = relationship("Submission", back_populates="problem", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="problem", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Problem {self.title}>"


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False, index=True)
    
    # Submission details
    code = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)
    status = Column(SQLEnum(SubmissionStatus), default=SubmissionStatus.PENDING, nullable=False)
    
    # Results
    test_results = Column(JSON)  # Results for each test case
    passed_tests = Column(Integer, default=0)
    total_tests = Column(Integer, default=0)
    score = Column(Integer, default=0)  # Out of 100
    
    # Execution metrics
    execution_time = Column(Integer)  # In milliseconds
    memory_used = Column(Integer)  # In KB
    
    # Error information
    error_message = Column(Text)
    
    # Difficulty mode
    difficulty_mode = Column(String(20), default="medium")  # easy, medium, hard
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    user = relationship("User", back_populates="submissions")
    problem = relationship("Problem", back_populates="submissions")
    feedback = relationship("AIFeedback", back_populates="submission", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Submission {self.id} - {self.status}>"



class LearningTrack(Base):
    """A learning curriculum track (e.g. Python Fundamentals)"""
    __tablename__ = "learning_tracks"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text)
    language = Column(String(50), nullable=False)          # 'python', 'javascript'
    icon = Column(String(10), default="📚")
    color = Column(String(50), default="neutral")
    difficulty = Column(String(30), default="Beginner")    # Beginner / Intermediate / Advanced
    is_published = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    modules = relationship("LearningModule", back_populates="track",
                           cascade="all, delete-orphan",
                           order_by="LearningModule.display_order")

    def __repr__(self):
        return f"<LearningTrack {self.title}>"


class LearningModule(Base):
    """A module inside a learning track (e.g. Module 1: Intro to Python)"""
    __tablename__ = "learning_modules"

    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(Integer, ForeignKey("learning_tracks.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text)
    icon = Column(String(10), default="📖")
    duration_minutes = Column(Integer, default=0)    # Total duration for the module
    display_order = Column(Integer, default=0)       # Order within the track
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    track = relationship("LearningTrack", back_populates="modules")
    submodules = relationship("LearningSubmodule", back_populates="module",
                              cascade="all, delete-orphan",
                              order_by="LearningSubmodule.display_order")

    def __repr__(self):
        return f"<LearningModule {self.title}>"


class LearningSubmodule(Base):
    """A lesson/submodule inside a module (e.g. 1.1 What is Python?)"""
    __tablename__ = "learning_submodules"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("learning_modules.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    submodule_key = Column(String(20))               # e.g. '1.1', '2.3'
    duration_minutes = Column(Integer, default=10)
    content_points = Column(JSON)                    # List of bullet-point strings
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    module = relationship("LearningModule", back_populates="submodules")
    user_progress = relationship("UserLearningProgress", back_populates="submodule",
                                 cascade="all, delete-orphan")

    def __repr__(self):
        return f"<LearningSubmodule {self.submodule_key}: {self.title}>"


class Bookmark(Base):
    """User bookmarked problems"""
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="bookmarks")
    problem = relationship("Problem", back_populates="bookmarks")

    def __repr__(self):
        return f"<Bookmark User:{self.user_id} Problem:{self.problem_id}>"


class AIFeedback(Base):
    """AI-generated feedback for a submission"""
    __tablename__ = "ai_feedback"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, unique=True, index=True)
    feedback_text = Column(Text)
    suggestions = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    submission = relationship("Submission", back_populates="feedback")

    def __repr__(self):
        return f"<AIFeedback Submission:{self.submission_id}>"


class UserLearningProgress(Base):
    """Tracks which submodules a user has completed"""
    __tablename__ = "user_learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    submodule_id = Column(Integer, ForeignKey("learning_submodules.id"), nullable=False, index=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    submodule = relationship("LearningSubmodule", back_populates="user_progress")

    def __repr__(self):
        return f"<UserLearningProgress User:{self.user_id} Submodule:{self.submodule_id}>"
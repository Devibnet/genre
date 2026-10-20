"""Pydantic schemas for Quiz resource and grading."""

from typing import Optional, List
from pydantic import BaseModel, Field
from app.utils.storage import build_public_url


class QuizCreateSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    article_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = Field(default=None, gt=0)
    status: str = Field(default="draft", pattern="^(draft|published)$")


class QuizUpdateSchema(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, min_length=1)
    article_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = Field(default=None, gt=0)
    status: Optional[str] = Field(default=None, pattern="^(draft|published)$")


class QuestionCreateSchema(BaseModel):
    question: str = Field(..., min_length=1)
    explanation: Optional[str] = None
    order_number: int = Field(..., gt=0)


class QuestionUpdateSchema(BaseModel):
    question: Optional[str] = Field(default=None, min_length=1)
    explanation: Optional[str] = None
    order_number: Optional[int] = Field(default=None, gt=0)


class OptionCreateSchema(BaseModel):
    option_text: str = Field(..., min_length=1)
    is_correct: bool = Field(default=False)
    order_number: int = Field(..., gt=0)


class OptionUpdateSchema(BaseModel):
    option_text: Optional[str] = Field(default=None, min_length=1)
    is_correct: Optional[bool] = None
    order_number: Optional[int] = Field(default=None, gt=0)


class QuizAnswerItem(BaseModel):
    question_id: str = Field(..., min_length=1)
    option_id: str = Field(..., min_length=1)


class QuizSubmitSchema(BaseModel):
    answers: List[QuizAnswerItem] = Field(..., min_length=1)
    participant_name: Optional[str] = Field(default="Peserta Mandiri", max_length=255)


def format_submission_dto(submission: dict) -> dict:
    """Format quiz submission row for admin."""
    return {
        "id": str(submission.get("id")),
        "quiz_id": str(submission.get("quiz_id")),
        "participant_name": submission.get("participant_name") or "Peserta Mandiri",
        "score": submission.get("score", 0),
        "total_questions": submission.get("total_questions", 0),
        "percentage": float(submission.get("percentage", 0.0)),
        "answers_summary": submission.get("answers_summary", []),
        "created_at": submission.get("created_at"),
    }


def format_option_dto(option: dict, is_admin: bool = False) -> dict:
    """Format quiz option row. Omits `is_correct` for public users."""
    dto = {
        "id": str(option.get("id")),
        "question_id": str(option.get("question_id")),
        "option_text": option.get("option_text"),
        "order_number": option.get("order_number"),
    }
    if is_admin:
        dto["is_correct"] = option.get("is_correct", False)
        dto["created_at"] = option.get("created_at")
    return dto


def format_question_dto(question: dict, options: List[dict] = None, is_admin: bool = False) -> dict:
    """Format quiz question row with formatted option list."""
    formatted_options = [format_option_dto(opt, is_admin=is_admin) for opt in (options or [])]
    formatted_options.sort(key=lambda x: x.get("order_number", 0))

    dto = {
        "id": str(question.get("id")),
        "quiz_id": str(question.get("quiz_id")),
        "question": question.get("question"),
        "explanation": question.get("explanation"),
        "order_number": question.get("order_number"),
        "options": formatted_options,
    }
    if is_admin:
        dto["created_at"] = question.get("created_at")
        dto["updated_at"] = question.get("updated_at")
    return dto


def format_quiz_dto(quiz: dict, questions: Optional[List[dict]] = None, is_admin: bool = False) -> dict:
    """Format quiz row."""
    dto = {
        "id": str(quiz.get("id")),
        "article_id": str(quiz.get("article_id")) if quiz.get("article_id") else None,
        "title": quiz.get("title"),
        "description": quiz.get("description"),
        "thumbnail_url": build_public_url(quiz.get("thumbnail_url")),
        "duration": quiz.get("duration"),
        "status": quiz.get("status"),
        "created_at": quiz.get("created_at"),
    }
    if questions is not None:
        dto["questions"] = questions
    if is_admin:
        dto["created_by"] = quiz.get("created_by")
        dto["updated_at"] = quiz.get("updated_at")
    return dto

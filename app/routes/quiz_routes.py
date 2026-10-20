"""Quiz routes (Public and Admin)."""

from flask import Blueprint, request, g
from app.services.quiz_service import QuizService
from app.schemas.quiz_schema import (
    QuizCreateSchema,
    QuizUpdateSchema,
    QuestionCreateSchema,
    QuestionUpdateSchema,
    OptionCreateSchema,
    OptionUpdateSchema,
    QuizSubmitSchema,
    format_quiz_dto,
    format_question_dto,
    format_option_dto,
    format_submission_dto,
)
from app.utils.validation import validate_request
from app.utils.response import success_response, list_response
from app.middleware.auth import require_admin

quiz_bp = Blueprint("quizzes", __name__, url_prefix="/api/v1")


# --- PUBLIC ENDPOINTS ---

@quiz_bp.get("/quizzes")
def get_public_quizzes():
    """List published quizzes."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    quizzes, total = QuizService.get_public_quizzes(page=page, per_page=per_page)
    formatted = [format_quiz_dto(q, is_admin=False) for q in quizzes]

    return list_response(data=formatted, page=page, per_page=per_page, total=total)


@quiz_bp.get("/quizzes/<quiz_id>")
def get_public_quiz_by_id(quiz_id: str):
    """Get published quiz details."""
    quiz, _ = QuizService.get_quiz_with_questions(quiz_id, is_admin=False)
    return success_response(data=format_quiz_dto(quiz, is_admin=False))


@quiz_bp.get("/quizzes/<quiz_id>/questions")
def get_public_quiz_questions(quiz_id: str):
    """Get quiz questions for public user. HIDES is_correct."""
    _, questions_with_opts = QuizService.get_quiz_with_questions(quiz_id, is_admin=False)
    formatted_questions = [
        format_question_dto(item["question"], options=item["options"], is_admin=False)
        for item in questions_with_opts
    ]
    return success_response(data=formatted_questions)


@quiz_bp.post("/quizzes/<quiz_id>/submit")
@validate_request(QuizSubmitSchema)
def submit_quiz_grading(quiz_id: str, validated_data: QuizSubmitSchema):
    """Submit quiz answers for server-side grading and persist result record."""
    answers = [ans.model_dump() for ans in validated_data.answers]
    result = QuizService.grade_submission(quiz_id, answers, participant_name=validated_data.participant_name)
    return success_response(data=result, message="Quiz submission successfully graded")


# --- ADMIN ENDPOINTS ---

@quiz_bp.get("/admin/quizzes")
@require_admin
def get_admin_quizzes():
    """List all quizzes for admin management."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    status = request.args.get("status", type=str)

    quizzes, total = QuizService.get_admin_quizzes(page=page, per_page=per_page, status=status)
    formatted = [format_quiz_dto(q, is_admin=True) for q in quizzes]

    return list_response(data=formatted, page=page, per_page=per_page, total=total)


@quiz_bp.get("/admin/quizzes/<quiz_id>")
@require_admin
def get_admin_quiz_by_id(quiz_id: str):
    """Get quiz details with questions and options for admin."""
    quiz, questions_with_opts = QuizService.get_quiz_with_questions(quiz_id, is_admin=True)
    formatted_questions = [
        format_question_dto(item["question"], options=item["options"], is_admin=True)
        for item in questions_with_opts
    ]
    formatted_quiz = format_quiz_dto(quiz, questions=formatted_questions, is_admin=True)
    return success_response(data=formatted_quiz)


@quiz_bp.post("/admin/quizzes")
@require_admin
@validate_request(QuizCreateSchema)
def create_quiz(validated_data: QuizCreateSchema):
    """Create a new quiz."""
    profile_id = g.profile["id"]
    quiz = QuizService.create_quiz(validated_data.model_dump(), profile_id=profile_id)
    return success_response(data=format_quiz_dto(quiz, is_admin=True), message="Quiz created successfully", status_code=201)


@quiz_bp.put("/admin/quizzes/<quiz_id>")
@require_admin
@validate_request(QuizUpdateSchema)
def update_quiz(quiz_id: str, validated_data: QuizUpdateSchema):
    """Update existing quiz."""
    quiz = QuizService.update_quiz(quiz_id, validated_data.model_dump(exclude_unset=True))
    return success_response(data=format_quiz_dto(quiz, is_admin=True), message="Quiz updated successfully")


@quiz_bp.delete("/admin/quizzes/<quiz_id>")
@require_admin
def delete_quiz(quiz_id: str):
    """Delete quiz."""
    QuizService.delete_quiz(quiz_id)
    return success_response(data=None, message="Quiz deleted successfully")


@quiz_bp.post("/admin/quizzes/<quiz_id>/publish")
@require_admin
def publish_quiz(quiz_id: str):
    """Publish quiz after validating questions and options."""
    quiz = QuizService.publish_quiz(quiz_id)
    return success_response(data=format_quiz_dto(quiz, is_admin=True), message="Quiz published successfully")


@quiz_bp.post("/admin/quizzes/<quiz_id>/unpublish")
@require_admin
def unpublish_quiz(quiz_id: str):
    """Unpublish quiz."""
    quiz = QuizService.unpublish_quiz(quiz_id)
    return success_response(data=format_quiz_dto(quiz, is_admin=True), message="Quiz unpublished successfully")


# --- QUESTION ADMIN ENDPOINTS ---

@quiz_bp.post("/admin/quizzes/<quiz_id>/questions")
@require_admin
@validate_request(QuestionCreateSchema)
def create_question(quiz_id: str, validated_data: QuestionCreateSchema):
    """Add a question to a quiz."""
    question = QuizService.create_question(quiz_id, validated_data.model_dump())
    return success_response(data=format_question_dto(question, options=[], is_admin=True), message="Question created successfully", status_code=201)


@quiz_bp.put("/admin/questions/<question_id>")
@require_admin
@validate_request(QuestionUpdateSchema)
def update_question(question_id: str, validated_data: QuestionUpdateSchema):
    """Update question."""
    question = QuizService.update_question(question_id, validated_data.model_dump(exclude_unset=True))
    return success_response(data=format_question_dto(question, options=[], is_admin=True), message="Question updated successfully")


@quiz_bp.delete("/admin/questions/<question_id>")
@require_admin
def delete_question(question_id: str):
    """Delete question."""
    QuizService.delete_question(question_id)
    return success_response(data=None, message="Question deleted successfully")


# --- OPTION ADMIN ENDPOINTS ---

@quiz_bp.post("/admin/questions/<question_id>/options")
@require_admin
@validate_request(OptionCreateSchema)
def create_option(question_id: str, validated_data: OptionCreateSchema):
    """Add an option to a question."""
    option = QuizService.create_option(question_id, validated_data.model_dump())
    return success_response(data=format_option_dto(option, is_admin=True), message="Option created successfully", status_code=201)


@quiz_bp.put("/admin/options/<option_id>")
@require_admin
@validate_request(OptionUpdateSchema)
def update_option(option_id: str, validated_data: OptionUpdateSchema):
    """Update option."""
    option = QuizService.update_option(option_id, validated_data.model_dump(exclude_unset=True))
    return success_response(data=format_option_dto(option, is_admin=True), message="Option updated successfully")


@quiz_bp.delete("/admin/options/<option_id>")
@require_admin
def delete_option(option_id: str):
    """Delete option."""
    QuizService.delete_option(option_id)
    return success_response(data=None, message="Option deleted successfully")


# --- SUBMISSION & RESULTS ADMIN ENDPOINTS ---

@quiz_bp.get("/admin/quizzes/<quiz_id>/results")
@require_admin
def get_admin_quiz_results(quiz_id: str):
    """Get participant submission results for a specific quiz."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search", type=str)

    submissions, total = QuizService.get_quiz_submissions(quiz_id, page=page, per_page=per_page, search=search)
    formatted = [format_submission_dto(s) for s in submissions]

    return list_response(data=formatted, page=page, per_page=per_page, total=total)


@quiz_bp.get("/admin/quizzes/<quiz_id>/results/stats")
@require_admin
def get_admin_quiz_results_stats(quiz_id: str):
    """Get summary statistics of quiz submissions."""
    stats = QuizService.get_quiz_submission_stats(quiz_id)
    return success_response(data=stats)


@quiz_bp.delete("/admin/quiz-submissions/<submission_id>")
@require_admin
def delete_admin_quiz_submission(submission_id: str):
    """Delete a participant submission record."""
    QuizService.delete_quiz_submission(submission_id)
    return success_response(data=None, message="Hasil kuis peserta berhasil dihapus")


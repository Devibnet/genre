"""Quiz service handling quiz, questions, options, publishing, and grading logic."""

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from app.extensions.supabase import get_supabase_admin_client
from app.middleware.error_handler import NotFoundException, ValidationException, AppException


class QuizService:
    """Business logic for Quizzes, Questions, Options, and Grading."""

    @staticmethod
    def get_public_quizzes(page: int = 1, per_page: int = 10) -> Tuple[list, int]:
        """Fetch published quizzes."""
        client = get_supabase_admin_client()
        per_page = min(max(1, per_page), 50)
        page = max(1, page)
        offset = (page - 1) * per_page

        res = client.table("quizzes").select("*", count="exact").eq("status", "published").order("created_at", desc=True).range(offset, offset + per_page - 1).execute()
        total = res.count if res.count is not None else len(res.data or [])
        return res.data or [], total

    @staticmethod
    def get_quiz_by_id(quiz_id: str) -> dict:
        """Fetch quiz record by ID."""
        client = get_supabase_admin_client()
        res = client.table("quizzes").select("*").eq("id", quiz_id).execute()
        if not res.data or len(res.data) == 0:
            raise NotFoundException(f"Quiz with ID '{quiz_id}' not found")
        return res.data[0]

    @staticmethod
    def get_quiz_with_questions(quiz_id: str, is_admin: bool = False) -> Tuple[dict, list]:
        """Fetch quiz details along with questions and options."""
        quiz = QuizService.get_quiz_by_id(quiz_id)
        if not is_admin and quiz.get("status") != "published":
            raise NotFoundException(f"Published quiz with ID '{quiz_id}' not found")

        client = get_supabase_admin_client()

        # Fetch questions
        q_res = client.table("quiz_questions").select("*").eq("quiz_id", quiz_id).order("order_number", desc=False).execute()
        questions = q_res.data or []

        if not questions:
            return quiz, []

        question_ids = [q["id"] for q in questions]

        # Fetch options for all questions in this quiz
        opt_res = client.table("quiz_options").select("*").in_("question_id", question_ids).order("order_number", desc=False).execute()
        all_options = opt_res.data or []

        # Group options by question_id
        options_map: Dict[str, list] = {}
        for opt in all_options:
            qid = str(opt["question_id"])
            if qid not in options_map:
                options_map[qid] = []
            options_map[qid].append(opt)

        questions_with_options = []
        for q in questions:
            qid = str(q["id"])
            opts = options_map.get(qid, [])
            questions_with_options.append({"question": q, "options": opts})

        return quiz, questions_with_options

    @staticmethod
    def get_admin_quizzes(page: int = 1, per_page: int = 10, status: Optional[str] = None) -> Tuple[list, int]:
        """Fetch all quizzes for admin management."""
        client = get_supabase_admin_client()
        per_page = min(max(1, per_page), 50)
        page = max(1, page)
        offset = (page - 1) * per_page

        query = client.table("quizzes").select("*", count="exact")
        if status:
            query = query.eq("status", status)

        res = query.order("created_at", desc=True).range(offset, offset + per_page - 1).execute()
        total = res.count if res.count is not None else len(res.data or [])
        return res.data or [], total

    @staticmethod
    def create_quiz(data: dict, profile_id: str) -> dict:
        """Create a new quiz."""
        client = get_supabase_admin_client()
        now_iso = datetime.now(timezone.utc).isoformat()

        insert_payload = {
            "title": data["title"],
            "description": data["description"],
            "article_id": data.get("article_id"),
            "thumbnail_url": data.get("thumbnail_url"),
            "duration": data.get("duration"),
            "status": data.get("status", "draft"),
            "created_by": profile_id,
            "created_at": now_iso,
            "updated_at": now_iso
        }

        res = client.table("quizzes").insert(insert_payload).execute()
        if not res.data:
            raise AppException("Failed to create quiz")
        return res.data[0]

    @staticmethod
    def update_quiz(quiz_id: str, data: dict) -> dict:
        """Update existing quiz."""
        existing = QuizService.get_quiz_by_id(quiz_id)
        client = get_supabase_admin_client()
        now_iso = datetime.now(timezone.utc).isoformat()

        update_payload: Dict[str, Any] = {"updated_at": now_iso}

        for key in ["title", "description", "article_id", "thumbnail_url", "duration", "status"]:
            if key in data and data[key] is not None:
                update_payload[key] = data[key]

        res = client.table("quizzes").update(update_payload).eq("id", quiz_id).execute()
        if not res.data:
            raise AppException("Failed to update quiz")
        return res.data[0]

    @staticmethod
    def publish_quiz(quiz_id: str) -> dict:
        """Publish quiz after validating question and option requirements."""
        quiz, questions_with_opts = QuizService.get_quiz_with_questions(quiz_id, is_admin=True)

        if not questions_with_opts or len(questions_with_opts) < 1:
            raise ValidationException("Quiz must have at least 1 question before it can be published")

        for item in questions_with_opts:
            q = item["question"]
            opts = item["options"]
            if len(opts) < 2:
                raise ValidationException(
                    f"Question #{q.get('order_number')} ('{q.get('question')[:30]}...') must have at least 2 options"
                )
            correct_count = sum(1 for o in opts if o.get("is_correct"))
            if correct_count < 1:
                raise ValidationException(
                    f"Question #{q.get('order_number')} must have at least one correct option"
                )

        client = get_supabase_admin_client()
        now_iso = datetime.now(timezone.utc).isoformat()
        res = client.table("quizzes").update({
            "status": "published",
            "updated_at": now_iso
        }).eq("id", quiz_id).execute()
        return res.data[0]

    @staticmethod
    def unpublish_quiz(quiz_id: str) -> dict:
        """Unpublish quiz."""
        QuizService.get_quiz_by_id(quiz_id)
        client = get_supabase_admin_client()
        now_iso = datetime.now(timezone.utc).isoformat()
        res = client.table("quizzes").update({
            "status": "draft",
            "updated_at": now_iso
        }).eq("id", quiz_id).execute()
        return res.data[0]

    @staticmethod
    def delete_quiz(quiz_id: str) -> bool:
        """Delete quiz (cascade deletes questions & options via DB FKs)."""
        QuizService.get_quiz_by_id(quiz_id)
        client = get_supabase_admin_client()
        client.table("quizzes").delete().eq("id", quiz_id).execute()
        return True

    # --- Questions Logic ---

    @staticmethod
    def create_question(quiz_id: str, data: dict) -> dict:
        """Create a question for a quiz."""
        QuizService.get_quiz_by_id(quiz_id)
        client = get_supabase_admin_client()
        now_iso = datetime.now(timezone.utc).isoformat()

        # Check unique constraint on (quiz_id, order_number)
        chk = client.table("quiz_questions").select("id").eq("quiz_id", quiz_id).eq("order_number", data["order_number"]).execute()
        if chk.data:
            raise ValidationException(f"Order number {data['order_number']} is already used in this quiz")

        payload = {
            "quiz_id": quiz_id,
            "question": data["question"],
            "explanation": data.get("explanation"),
            "order_number": data["order_number"],
            "created_at": now_iso,
            "updated_at": now_iso
        }
        res = client.table("quiz_questions").insert(payload).execute()
        return res.data[0]

    @staticmethod
    def update_question(question_id: str, data: dict) -> dict:
        """Update existing question."""
        client = get_supabase_admin_client()
        q_res = client.table("quiz_questions").select("*").eq("id", question_id).execute()
        if not q_res.data:
            raise NotFoundException(f"Question with ID '{question_id}' not found")
        existing = q_res.data[0]

        now_iso = datetime.now(timezone.utc).isoformat()
        update_payload: Dict[str, Any] = {"updated_at": now_iso}

        if "order_number" in data and data["order_number"] is not None and data["order_number"] != existing["order_number"]:
            chk = client.table("quiz_questions").select("id").eq("quiz_id", existing["quiz_id"]).eq("order_number", data["order_number"]).neq("id", question_id).execute()
            if chk.data:
                raise ValidationException(f"Order number {data['order_number']} is already used in this quiz")
            update_payload["order_number"] = data["order_number"]

        if "question" in data and data["question"] is not None:
            update_payload["question"] = data["question"]
        if "explanation" in data:
            update_payload["explanation"] = data["explanation"]

        res = client.table("quiz_questions").update(update_payload).eq("id", question_id).execute()
        return res.data[0]

    @staticmethod
    def delete_question(question_id: str) -> bool:
        """Delete question."""
        client = get_supabase_admin_client()
        client.table("quiz_questions").delete().eq("id", question_id).execute()
        return True

    # --- Options Logic ---

    @staticmethod
    def create_option(question_id: str, data: dict) -> dict:
        """Create an option for a question."""
        client = get_supabase_admin_client()
        q_res = client.table("quiz_questions").select("*").eq("id", question_id).execute()
        if not q_res.data:
            raise NotFoundException(f"Question with ID '{question_id}' not found")

        # Check unique constraint on (question_id, order_number)
        chk = client.table("quiz_options").select("id").eq("question_id", question_id).eq("order_number", data["order_number"]).execute()
        if chk.data:
            raise ValidationException(f"Option order number {data['order_number']} is already used for this question")

        now_iso = datetime.now(timezone.utc).isoformat()
        payload = {
            "question_id": question_id,
            "option_text": data["option_text"],
            "is_correct": data.get("is_correct", False),
            "order_number": data["order_number"],
            "created_at": now_iso
        }
        res = client.table("quiz_options").insert(payload).execute()
        return res.data[0]

    @staticmethod
    def update_option(option_id: str, data: dict) -> dict:
        """Update an option."""
        client = get_supabase_admin_client()
        opt_res = client.table("quiz_options").select("*").eq("id", option_id).execute()
        if not opt_res.data:
            raise NotFoundException(f"Option with ID '{option_id}' not found")
        existing = opt_res.data[0]

        update_payload: Dict[str, Any] = {}

        if "order_number" in data and data["order_number"] is not None and data["order_number"] != existing["order_number"]:
            chk = client.table("quiz_options").select("id").eq("question_id", existing["question_id"]).eq("order_number", data["order_number"]).neq("id", option_id).execute()
            if chk.data:
                raise ValidationException(f"Option order number {data['order_number']} is already used")
            update_payload["order_number"] = data["order_number"]

        if "option_text" in data and data["option_text"] is not None:
            update_payload["option_text"] = data["option_text"]
        if "is_correct" in data and data["is_correct"] is not None:
            update_payload["is_correct"] = data["is_correct"]

        if not update_payload:
            return existing

        res = client.table("quiz_options").update(update_payload).eq("id", option_id).execute()
        return res.data[0]

    @staticmethod
    def delete_option(option_id: str) -> bool:
        """Delete an option."""
        client = get_supabase_admin_client()
        client.table("quiz_options").delete().eq("id", option_id).execute()
        return True

    # --- Grading & Submissions Logic ---

    @staticmethod
    def grade_submission(quiz_id: str, user_answers: List[dict], participant_name: Optional[str] = None) -> dict:
        """Grade quiz submission and store result record in quiz_submissions table."""
        quiz, questions_with_opts = QuizService.get_quiz_with_questions(quiz_id, is_admin=True)

        if quiz.get("status") != "published":
            raise ValidationException("Cannot submit answers for an unpublished quiz")

        if not questions_with_opts:
            raise ValidationException("Quiz has no questions to grade")

        # Map questions and options for fast lookup
        questions_map = {}
        for item in questions_with_opts:
            q = item["question"]
            qid = str(q["id"])
            opts = {str(o["id"]): o for o in item["options"]}
            questions_map[qid] = {
                "question": q,
                "options": opts,
                "correct_option_id": next((str(o["id"]) for o in item["options"] if o.get("is_correct")), None)
            }

        # Map user answers: question_id -> option_id
        user_answer_map = {ans["question_id"]: ans["option_id"] for ans in user_answers}

        score = 0
        total_questions = len(questions_map)
        results = []

        for qid, q_info in questions_map.items():
            q_obj = q_info["question"]
            selected_option_id = user_answer_map.get(qid)
            correct_option_id = q_info["correct_option_id"]

            is_correct = False
            if selected_option_id and selected_option_id in q_info["options"]:
                selected_option = q_info["options"][selected_option_id]
                if selected_option.get("is_correct"):
                    is_correct = True

            if is_correct:
                score += 1

            results.append({
                "question_id": qid,
                "question": q_obj.get("question"),
                "explanation": q_obj.get("explanation"),
                "is_correct": is_correct,
                "selected_option_id": selected_option_id,
                "correct_option_id": correct_option_id
            })

        percentage = round((score / total_questions) * 100, 2) if total_questions > 0 else 0.0
        final_participant_name = (participant_name or "").strip() or "Peserta Mandiri"
        now_iso = datetime.now(timezone.utc).isoformat()

        client = get_supabase_admin_client()
        submission_payload = {
            "quiz_id": quiz_id,
            "participant_name": final_participant_name,
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "answers_summary": results,
            "created_at": now_iso
        }

        submission_id = None
        try:
            res = client.table("quiz_submissions").insert(submission_payload).execute()
            if res.data and len(res.data) > 0:
                submission_id = str(res.data[0].get("id"))
        except Exception as e:
            # If table does not exist or insert fails, log but do not block public user grading result
            import logging
            logging.getLogger(__name__).warning(f"Failed to persist quiz submission: {e}")

        return {
            "submission_id": submission_id,
            "quiz_id": quiz_id,
            "participant_name": final_participant_name,
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "results": results
        }

    @staticmethod
    def get_quiz_submissions(quiz_id: str, page: int = 1, per_page: int = 10, search: Optional[str] = None) -> Tuple[list, int]:
        """Fetch paginated submissions for a specific quiz with optional participant name search."""
        QuizService.get_quiz_by_id(quiz_id)
        client = get_supabase_admin_client()
        per_page = min(max(1, per_page), 50)
        page = max(1, page)
        offset = (page - 1) * per_page

        query = client.table("quiz_submissions").select("*", count="exact").eq("quiz_id", quiz_id)
        if search and search.strip():
            query = query.ilike("participant_name", f"%{search.strip()}%")

        res = query.order("created_at", desc=True).range(offset, offset + per_page - 1).execute()
        total = res.count if res.count is not None else len(res.data or [])
        return res.data or [], total

    @staticmethod
    def get_quiz_submission_stats(quiz_id: str) -> dict:
        """Calculate statistical summary for quiz submissions."""
        QuizService.get_quiz_by_id(quiz_id)
        client = get_supabase_admin_client()

        res = client.table("quiz_submissions").select("score, total_questions, percentage").eq("quiz_id", quiz_id).execute()
        rows = res.data or []

        total_participants = len(rows)
        if total_participants == 0:
            return {
                "total_participants": 0,
                "average_percentage": 0.0,
                "highest_percentage": 0.0,
                "lowest_percentage": 0.0,
                "passed_count": 0,
                "pass_rate": 0.0
            }

        percentages = [float(r.get("percentage", 0.0)) for r in rows]
        passed_count = sum(1 for p in percentages if p >= 60.0)
        avg_pct = round(sum(percentages) / total_participants, 1)
        max_pct = round(max(percentages), 1)
        min_pct = round(min(percentages), 1)
        pass_rate = round((passed_count / total_participants) * 100, 1)

        return {
            "total_participants": total_participants,
            "average_percentage": avg_pct,
            "highest_percentage": max_pct,
            "lowest_percentage": min_pct,
            "passed_count": passed_count,
            "pass_rate": pass_rate
        }

    @staticmethod
    def delete_quiz_submission(submission_id: str) -> bool:
        """Delete a single quiz submission record."""
        client = get_supabase_admin_client()
        chk = client.table("quiz_submissions").select("id").eq("id", submission_id).execute()
        if not chk.data:
            raise NotFoundException(f"Submission with ID '{submission_id}' not found")
        client.table("quiz_submissions").delete().eq("id", submission_id).execute()
        return True


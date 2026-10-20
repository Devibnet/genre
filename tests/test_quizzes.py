"""Tests for Quiz endpoints, question options, and grading logic."""

from unittest.mock import MagicMock


def test_public_quiz_questions_hides_is_correct(client, mock_supabase_client):
    """Test public questions endpoint never leaks the is_correct field."""
    # Quiz table mock
    quiz_table = mock_supabase_client.table("quizzes")
    quiz_table.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[{
        "id": "quiz-uuid-1",
        "title": "Quiz Kespro",
        "description": "Tes wawasan kesehatan reproduksi",
        "thumbnail_url": None,
        "duration": 15,
        "status": "published",
        "created_at": "2026-08-01T00:00:00Z"
    }])

    # Questions table mock
    q_table = mock_supabase_client.table("quiz_questions")
    q_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[{
        "id": "q-uuid-1",
        "quiz_id": "quiz-uuid-1",
        "question": "Berapa usia ideal pernikahan GenRe?",
        "explanation": "Usia minimal 21 wanita & 25 pria.",
        "order_number": 1
    }])

    # Options table mock
    opt_table = mock_supabase_client.table("quiz_options")
    opt_table.select.return_value.in_.return_value.order.return_value.execute.return_value = MagicMock(data=[
        {
            "id": "opt-uuid-1",
            "question_id": "q-uuid-1",
            "option_text": "21 wanita, 25 pria",
            "is_correct": True,
            "order_number": 1
        },
        {
            "id": "opt-uuid-2",
            "question_id": "q-uuid-1",
            "option_text": "15 wanita, 17 pria",
            "is_correct": False,
            "order_number": 2
        }
    ])

    response = client.get("/api/v1/quizzes/quiz-uuid-1/questions")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True

    questions = json_data["data"]
    assert len(questions) == 1
    options = questions[0]["options"]
    assert len(options) == 2

    # Verify is_correct is NOT present in public response
    for opt in options:
        assert "is_correct" not in opt


def test_quiz_grading_calculation(client, mock_supabase_client):
    """Test quiz grading endpoint calculates correct percentage without DB storage."""
    quiz_table = mock_supabase_client.table("quizzes")
    quiz_table.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[{
        "id": "quiz-uuid-1",
        "title": "Quiz Test",
        "description": "Desc",
        "status": "published",
        "created_at": "2026-08-01T00:00:00Z"
    }])

    q_table = mock_supabase_client.table("quiz_questions")
    q_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[{
        "id": "q-uuid-1",
        "quiz_id": "quiz-uuid-1",
        "question": "Pertanyaan 1?",
        "explanation": "Penjelasan 1",
        "order_number": 1
    }])

    opt_table = mock_supabase_client.table("quiz_options")
    opt_table.select.return_value.in_.return_value.order.return_value.execute.return_value = MagicMock(data=[
        {
            "id": "opt-correct-1",
            "question_id": "q-uuid-1",
            "option_text": "Jawaban Benar",
            "is_correct": True,
            "order_number": 1
        },
        {
            "id": "opt-wrong-1",
            "question_id": "q-uuid-1",
            "option_text": "Jawaban Salah",
            "is_correct": False,
            "order_number": 2
        }
    ])

    payload = {
        "answers": [
            {
                "question_id": "q-uuid-1",
                "option_id": "opt-correct-1"
            }
        ]
    }

    response = client.post("/api/v1/quizzes/quiz-uuid-1/submit", json=payload)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True

    result_data = json_data["data"]
    assert result_data["score"] == 1
    assert result_data["total_questions"] == 1
    assert result_data["percentage"] == 100.0
    assert result_data["results"][0]["is_correct"] is True


def test_admin_quiz_results(client, mock_supabase_client, admin_auth_headers):
    """Test admin quiz results endpoint returns paginated submissions."""
    quiz_table = mock_supabase_client.table("quizzes")
    quiz_table.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[{
        "id": "quiz-uuid-1",
        "title": "Quiz Test",
        "status": "published"
    }])

    sub_table = mock_supabase_client.table("quiz_submissions")
    sub_table.select.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(
        data=[{
            "id": "sub-1",
            "quiz_id": "quiz-uuid-1",
            "participant_name": "Budi Santoso",
            "score": 8,
            "total_questions": 10,
            "percentage": 80.0,
            "answers_summary": [],
            "created_at": "2026-09-04T12:00:00Z"
        }],
        count=1
    )

    response = client.get("/api/v1/admin/quizzes/quiz-uuid-1/results", headers=admin_auth_headers)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert len(json_data["data"]) == 1
    assert json_data["data"][0]["participant_name"] == "Budi Santoso"


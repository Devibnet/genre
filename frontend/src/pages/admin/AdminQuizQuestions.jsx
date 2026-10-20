import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import { Spinner } from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import { IconPlus, IconEdit, IconTrash } from '../../components/common/Icons';

const AdminQuizQuestions = () => {
  const { id: quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Modals
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentOption, setCurrentOption] = useState(null);

  // Delete Confirm States
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState(null);
  const [deleteOptionTarget, setDeleteOptionTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [questionFormData, setQuestionFormData] = useState({
    question: '',
    explanation: '',
    order_number: 1,
  });
  const [optionFormData, setOptionFormData] = useState({
    option_text: '',
    is_correct: false,
    order_number: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchQuizDetails = async () => {
    setLoading(true);
    try {
      const quizData = await quizService.getAdminQuizById(quizId);
      setQuiz(quizData);
    } catch (err) {
      showToast(err.message || 'Gagal memuat detail kuis', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizDetails();
  }, [quizId]);

  // Question handlers
  const handleOpenAddQuestion = () => {
    setCurrentQuestion(null);
    setQuestionFormData({
      question: '',
      explanation: '',
      order_number: quiz?.questions ? quiz.questions.length + 1 : 1,
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (question) => {
    setCurrentQuestion(question);
    setQuestionFormData({
      question: question.question || '',
      explanation: question.explanation || '',
      order_number: question.order_number || 1,
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...questionFormData,
        order_number: parseInt(questionFormData.order_number),
      };

      if (currentQuestion) {
        await quizService.updateQuestion(currentQuestion.id, payload);
        showToast('Pertanyaan berhasil diperbarui');
      } else {
        await quizService.createQuestion(quizId, payload);
        showToast('Pertanyaan berhasil ditambahkan');
      }
      setIsQuestionModalOpen(false);
      fetchQuizDetails();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan pertanyaan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteQuestion = async () => {
    if (!deleteQuestionTarget) return;
    setIsDeleting(true);
    try {
      await quizService.deleteQuestion(deleteQuestionTarget.id);
      showToast('Pertanyaan berhasil dihapus');
      setDeleteQuestionTarget(null);
      fetchQuizDetails();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus pertanyaan', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Option handlers
  const handleOpenAddOption = (question) => {
    setCurrentQuestion(question);
    setCurrentOption(null);
    setOptionFormData({
      option_text: '',
      is_correct: false,
      order_number: question.options ? question.options.length + 1 : 1,
    });
    setIsOptionModalOpen(true);
  };

  const handleOpenEditOption = (question, option) => {
    setCurrentQuestion(question);
    setCurrentOption(option);
    setOptionFormData({
      option_text: option.option_text || '',
      is_correct: option.is_correct || false,
      order_number: option.order_number || 1,
    });
    setIsOptionModalOpen(true);
  };

  const handleSaveOption = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...optionFormData,
        order_number: parseInt(optionFormData.order_number),
      };

      if (currentOption) {
        await quizService.updateOption(currentOption.id, payload);
        showToast('Pilihan jawaban berhasil diperbarui');
      } else {
        await quizService.createOption(currentQuestion.id, payload);
        showToast('Pilihan jawaban berhasil ditambahkan');
      }
      setIsOptionModalOpen(false);
      fetchQuizDetails();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan pilihan jawaban', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteOption = async () => {
    if (!deleteOptionTarget) return;
    setIsDeleting(true);
    try {
      await quizService.deleteOption(deleteOptionTarget.id);
      showToast('Pilihan jawaban berhasil dihapus');
      setDeleteOptionTarget(null);
      fetchQuizDetails();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus pilihan jawaban', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !quiz) return <Spinner message="Memuat soal kuis..." />;

  return (
    <div className="admin-page-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <Link to="/admin/quizzes" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
            &larr; Kembali ke Kuis
          </Link>
          <h1>Kelola Soal Kuis</h1>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: '4px' }}>
            {quiz?.title}
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddQuestion} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <IconPlus size={16} />
          <span>Tambah Pertanyaan</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {!quiz?.questions || quiz.questions.length === 0 ? (
          <div className="dash-panel" style={{ textAlign: 'center', padding: '48px' }}>
            <h3 style={{ margin: '16px 0 8px', color: 'var(--dark)' }}>Kuis ini belum memiliki soal</h3>
            <p style={{ color: 'var(--slate-500)', marginBottom: '20px' }}>
              Mulai buat soal pilihan ganda agar kuis dapat dikerjakan oleh pengguna.
            </p>
            <button className="btn btn-primary" onClick={handleOpenAddQuestion} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <IconPlus size={16} />
              <span>Tambah Pertanyaan Pertama</span>
            </button>
          </div>
        ) : (
          quiz.questions.map((q, idx) => (
            <div key={q.id} className="dash-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--slate-100)', paddingBottom: '12px' }}>
                <div style={{ flexGrow: 1, paddingRight: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--primary)' }}>#{q.order_number}</span> {q.question}
                  </h3>
                  {q.explanation && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '6px', fontStyle: 'italic', backgroundColor: 'var(--slate-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                      Penjelasan: {q.explanation}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline btn-xs" onClick={() => handleOpenAddOption(q)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <IconPlus size={12} />
                    <span>Tambah Opsi</span>
                  </button>
                  <button className="btn btn-outline btn-xs" onClick={() => handleOpenEditQuestion(q)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <IconEdit size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="btn btn-outline btn-xs"
                    style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => setDeleteQuestionTarget(q)}
                  >
                    <IconTrash size={12} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              {/* Options list */}
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Pilihan Jawaban:
                </p>
                {!q.options || q.options.length === 0 ? (
                  <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Belum ada opsi jawaban. Harap tambahkan opsi agar pertanyaan ini valid.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: opt.is_correct ? '1px solid var(--success)' : '1px solid var(--slate-200)',
                          backgroundColor: opt.is_correct ? 'rgba(34, 197, 94, 0.05)' : 'var(--white)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: opt.is_correct ? 'var(--success)' : 'var(--slate-100)',
                              color: opt.is_correct ? 'var(--white)' : 'var(--slate-500)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {opt.order_number}
                          </span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>{opt.option_text}</span>
                          {opt.is_correct && (
                            <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                              Jawaban Benar
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => handleOpenEditOption(q, opt)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <IconEdit size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setDeleteOptionTarget(opt)}
                          >
                            <IconTrash size={12} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Question Form Modal */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={currentQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'}
      >
        <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="question">Pertanyaan *</label>
            <textarea
              id="question"
              className="form-input"
              value={questionFormData.question}
              onChange={(e) => setQuestionFormData(prev => ({ ...prev, question: e.target.value }))}
              required
              placeholder="Tulis kalimat pertanyaan..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="order_number">No. Urut Soal *</label>
            <input
              type="number"
              id="order_number"
              className="form-input"
              value={questionFormData.order_number}
              onChange={(e) => setQuestionFormData(prev => ({ ...prev, order_number: e.target.value }))}
              required
              min={1}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="explanation">Penjelasan Jawaban (opsional)</label>
            <textarea
              id="explanation"
              className="form-input"
              value={questionFormData.explanation}
              onChange={(e) => setQuestionFormData(prev => ({ ...prev, explanation: e.target.value }))}
              placeholder="Penjelasan akan muncul setelah user menyelesaikan kuis..."
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsQuestionModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Option Form Modal */}
      <Modal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        title={currentOption ? 'Edit Pilihan Jawaban' : 'Tambah Pilihan Jawaban'}
      >
        <form onSubmit={handleSaveOption} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="option_text">Teks Pilihan *</label>
            <input
              type="text"
              id="option_text"
              className="form-input"
              value={optionFormData.option_text}
              onChange={(e) => setOptionFormData(prev => ({ ...prev, option_text: e.target.value }))}
              required
              placeholder="Contoh: Sangat Setuju / Kurang Sehat"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="opt_order_number">No. Urut Opsi *</label>
            <input
              type="number"
              id="opt_order_number"
              className="form-input"
              value={optionFormData.order_number}
              onChange={(e) => setOptionFormData(prev => ({ ...prev, order_number: e.target.value }))}
              required
              min={1}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <input
              type="checkbox"
              id="is_correct"
              checked={optionFormData.is_correct}
              onChange={(e) => setOptionFormData(prev => ({ ...prev, is_correct: e.target.checked }))}
            />
            <label htmlFor="is_correct" style={{ fontSize: '0.9rem', color: 'var(--slate-700)', cursor: 'pointer', userSelect: 'none' }}>
              Jadikan sebagai Jawaban Benar
            </label>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsOptionModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modals */}
      <ConfirmModal
        isOpen={Boolean(deleteQuestionTarget)}
        onClose={() => setDeleteQuestionTarget(null)}
        onConfirm={handleConfirmDeleteQuestion}
        title="Hapus Pertanyaan"
        message={`Apakah Anda yakin ingin menghapus pertanyaan ini beserta semua pilihan jawabannya? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Permanen"
        cancelText="Batal"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={Boolean(deleteOptionTarget)}
        onClose={() => setDeleteOptionTarget(null)}
        onConfirm={handleConfirmDeleteOption}
        title="Hapus Pilihan Jawaban"
        message={`Apakah Anda yakin ingin menghapus opsi "${deleteOptionTarget?.option_text}"?`}
        confirmText="Hapus Opsi"
        cancelText="Batal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminQuizQuestions;

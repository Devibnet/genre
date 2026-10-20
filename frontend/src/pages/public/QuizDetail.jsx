import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import { Spinner } from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import { generateQuizReportPDF } from '../../utils/generateQuizReportPDF';
import { IconSparkles, IconCheck, IconEye } from '../../components/common/Icons';
import './QuizDetail.css';

const RING_RADIUS = 60;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const CONFETTI_COLORS = ['#16a34a', '#14532d', '#d97706', '#4ade80', '#fbbf24', '#0284c7'];

// Local SVG Icons
const IconClock = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconBookmark = ({ size = 16, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const IconFileCheck = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15l2 2 4-4" />
  </svg>
);

const IconDownload = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconShield = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconGrid = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const AmbientBackdrop = () => (
  <div className="eval-ambient" aria-hidden="true">
    <div className="eval-orb eval-orb-green" />
    <div className="eval-orb eval-orb-amber" />
    <div className="eval-grid-overlay" />
  </div>
);

const QuizDetail = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [ringOffset, setRingOffset] = useState(RING_CIRCUMFERENCE);
  const [confetti, setConfetti] = useState([]);
  const [participantName, setParticipantName] = useState('');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large' | 'xlarge'
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      setLoading(true);
      try {
        const [quizData, questionsData] = await Promise.all([
          quizService.getPublicQuizById(id),
          quizService.getPublicQuizQuestions(id),
        ]);
        setQuiz(quizData);
        setQuestions(questionsData);
      } catch (err) {
        setError(err.message || 'Materi kuis tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [id]);

  const handleSelectAnswer = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleToggleBookmark = (questionId) => {
    setBookmarked(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleJumpTo = (idx) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentIndex(idx);
      setIsMobilePaletteOpen(false);
    }
  };

  const handleSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsMobilePaletteOpen(false);
    setSubmitting(true);
    try {
      const answersPayload = Object.entries(answers).map(([question_id, option_id]) => ({
        question_id,
        option_id,
      }));
      const res = await quizService.submitQuiz(id, answersPayload, participantName.trim() || 'Peserta Mandiri');
      setResult(res);
    } catch (err) {
      alert(err.message || 'Gagal mengirimkan lembar jawaban kuis.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
    if (quiz && quiz.duration) {
      setSecondsLeft(quiz.duration * 60);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentIndex(0);
    setAnswers({});
    setBookmarked({});
    setResult(null);
    setSecondsLeft(0);
    setRingOffset(RING_CIRCUMFERENCE);
    setConfetti([]);
  };

  const handleDownloadPDF = () => {
    setIsDownloadingPDF(true);
    try {
      generateQuizReportPDF({
        userName: participantName.trim() || 'Peserta Mandiri',
        quiz,
        result,
        questions,
        userAnswers: answers,
      });
    } catch {
      alert('Gagal menyusun lembar laporan PDF.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!started || !quiz || !quiz.duration || result) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, quiz, result]);

  // Auto-submit when time expires
  useEffect(() => {
    if (!started || !quiz || !quiz.duration || secondsLeft !== 0 || result || submitting) return;
    const t = setTimeout(() => handleSubmit(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, started, quiz, result, submitting]);

  // Animate result radar ring
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => {
      setRingOffset(RING_CIRCUMFERENCE * (1 - (result.percentage || 0) / 100));
    }, 120);
    return () => clearTimeout(t);
  }, [result]);

  // Confetti trigger
  useEffect(() => {
    if (!result || (result.percentage || 0) < 60) return;
    const pieces = Array.from({ length: 36 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2.2 + Math.random() * 2,
      size: 6 + Math.random() * 8,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    }));
    const t = setTimeout(() => setConfetti(pieces), 80);
    return () => clearTimeout(t);
  }, [result]);

  // Keyboard controls
  useEffect(() => {
    if (!started || result || !questions.length) return;
    const current = questions[currentIndex];
    if (!current) return;

    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= current.options.length) {
        handleSelectAnswer(current.id, current.options[num - 1].id);
      } else if (e.key.toUpperCase() >= 'A' && e.key.toUpperCase() <= 'E') {
        const charIdx = e.key.toUpperCase().charCodeAt(0) - 65;
        if (charIdx < current.options.length) {
          handleSelectAnswer(current.id, current.options[charIdx].id);
        }
      } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePrev();
      } else if (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'b') {
        handleToggleBookmark(current.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, result, questions, currentIndex]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const bookmarkedCount = Object.values(bookmarked).filter(Boolean).length;
  const remainingCount = questions.length - answeredCount;

  if (loading) {
    return (
      <div className="eval-page-wrap">
        <AmbientBackdrop />
        <div className="eval-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
          <Spinner message="Menyiapkan lembar evaluasi..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eval-page-wrap">
        <AmbientBackdrop />
        <div className="eval-container">
          <Link to="/quiz" className="eval-back-link">
            &larr; Kembali ke Daftar Kuis
          </Link>
          <div style={{ background: '#ffffff', padding: '36px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: 'var(--error)', marginBottom: '8px' }}>Materi Kuis Tidak Ditemukan</h3>
            <p style={{ color: '#64748b' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 1. RESULTS SCREEN
  // ==========================================
  if (result) {
    const percentage = result.percentage || 0;
    const grade =
      percentage >= 80
        ? { level: 'Sangat Memuaskan', color: '#16a34a', desc: 'Luar biasa! Pemahaman materi Anda sudah sangat matang dan komprehensif.' }
        : percentage >= 60
          ? { level: 'Cukup Baik', color: '#d97706', desc: 'Bagus! Anda telah menguasai poin-poin penting materi dengan baik.' }
          : { level: 'Perlu Pendalaman', color: '#dc2626', desc: 'Dianjurkan membaca kembali materi edukasi terkait untuk hasil yang maksimal.' };

    const detailedResults = result.results || [];

    return (
      <div className="eval-page-wrap">
        <AmbientBackdrop />
        {confetti.map(p => (
          <span
            key={p.id}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              width: p.size,
              height: p.size * 1.5,
              backgroundColor: p.color,
            }}
          />
        ))}

        <div className="eval-container">
          <div className="eval-result-card">
            <div className="eval-result-header">
              <span className="eval-badge-tag">
                <IconSparkles size={13} />
                <span>Hasil Evaluasi Pembelajaran</span>
              </span>

              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '8px 0 4px', color: '#ffffff' }}>
                {quiz.title}
              </h1>
              <p style={{ color: '#e2e8f0', fontSize: '0.9rem', margin: 0 }}>
                Peserta: <strong style={{ color: '#ffffff' }}>{participantName.trim() || 'Peserta Mandiri'}</strong>
              </p>

              {/* Score Ring */}
              <div className="eval-score-ring">
                <svg viewBox="0 0 150 150">
                  <circle className="ring-track" cx="75" cy="75" r={RING_RADIUS} />
                  <circle
                    className="ring-progress"
                    cx="75"
                    cy="75"
                    r={RING_RADIUS}
                    stroke={grade.color}
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                <div className="eval-ring-center">
                  <span className="eval-ring-val">{percentage}%</span>
                  <span className="eval-ring-lbl">Skor Akhir</span>
                </div>
              </div>

              <div style={{
                display: 'inline-block',
                padding: '6px 18px',
                borderRadius: '999px',
                background: '#ffffff',
                color: grade.color,
                fontWeight: 800,
                fontSize: '0.86rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {grade.level}
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '0.86rem', maxWidth: '560px', margin: '12px auto 0' }}>
                {grade.desc}
              </p>
            </div>

            <div className="eval-result-body">
              {/* Stat Grid */}
              <div className="eval-result-stats-grid">
                <div className="eval-res-stat-card">
                  <span className="eval-res-stat-val" style={{ color: '#16a34a' }}>{result.score}</span>
                  <span className="eval-res-stat-lbl">Jawaban Benar</span>
                </div>
                <div className="eval-res-stat-card">
                  <span className="eval-res-stat-val" style={{ color: '#dc2626' }}>{result.total_questions - result.score}</span>
                  <span className="eval-res-stat-lbl">Kurang Tepat</span>
                </div>
                <div className="eval-res-stat-card">
                  <span className="eval-res-stat-val" style={{ color: '#0f172a' }}>{result.total_questions}</span>
                  <span className="eval-res-stat-lbl">Total Soal</span>
                </div>
              </div>

              {/* PDF Download Card */}
              <div className="eval-pdf-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconFileCheck size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', fontWeight: 750, color: '#0f172a' }}>
                      Unduh Laporan PDF
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                      Dokumen resmi memuat rincian skor dan pembahasan materi.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
                >
                  <IconDownload size={14} />
                  <span>{isDownloadingPDF ? 'Menyiapkan Dokumen...' : 'Download PDF'}</span>
                </button>
              </div>

              {/* Detailed Question Review */}
              <div>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconEye size={17} />
                  <span>Rincian Pembahasan Soal</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {questions.map((q, idx) => {
                    const qRes = detailedResults.find((r) => String(r.question_id) === String(q.id));
                    const isCorrect = qRes ? qRes.is_correct : false;
                    const selectedOptId = answers[q.id] || (qRes ? qRes.selected_option_id : null);
                    const selectedOpt = q.options?.find((o) => String(o.id) === String(selectedOptId));
                    const correctOpt = q.options?.find((o) => String(o.id) === String(qRes?.correct_option_id));

                    return (
                      <div
                        key={q.id}
                        className={`eval-review-item ${isCorrect ? 'is-correct' : 'is-wrong'}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#475569' }}>
                            Soal No. {idx + 1}
                          </span>
                          <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                            {isCorrect ? '✓ Benar' : '✗ Kurang Tepat'}
                          </span>
                        </div>

                        <p style={{ fontWeight: 600, fontSize: '0.94rem', color: '#0f172a', margin: '0 0 10px', lineHeight: 1.5 }}>
                          {q.question}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Jawaban Anda:</span>
                            <strong style={{ color: isCorrect ? '#16a34a' : '#dc2626', fontSize: '0.88rem' }}>
                              {selectedOpt ? selectedOpt.option_text : '(Tidak Dijawab)'}
                            </strong>
                          </div>

                          {!isCorrect && correctOpt && (
                            <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Kunci Jawaban:</span>
                              <strong style={{ color: '#16a34a', fontSize: '0.88rem' }}>{correctOpt.option_text}</strong>
                            </div>
                          )}
                        </div>

                        {q.explanation && (
                          <div className="eval-explanation-box">
                            <strong style={{ color: '#14532d' }}>Pembahasan:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Action */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={handleRestart}>
                  &larr; Coba Ulang Kuis
                </button>
                <Link to="/quiz" className="btn btn-primary">
                  Kembali ke Daftar Kuis &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. INTRO BRIEFING STAGE
  // ==========================================
  if (!started) {
    return (
      <div className="eval-page-wrap">
        <AmbientBackdrop />
        <div className="eval-container">
          <Link to="/quiz" className="eval-back-link">
            &larr; Kembali ke Daftar Kuis
          </Link>

          <div className="eval-intro-card">
            <div className="eval-intro-header">
              <span className="eval-badge-tag">
                <IconShield size={14} />
                <span>Evaluasi Edukasi &bull; Forum GenRe Buleleng</span>
              </span>
              <h1 className="eval-intro-title">{quiz.title}</h1>
              <p className="eval-intro-desc">{quiz.description}</p>
            </div>

            <div className="eval-intro-body">
              {/* Specs */}
              <div className="eval-specs-grid">
                <div className="eval-spec-item">
                  <div className="eval-spec-icon"><IconFileCheck size={20} /></div>
                  <div>
                    <div className="eval-spec-lbl">Jumlah Soal</div>
                    <div className="eval-spec-val">{questions.length} Butir</div>
                  </div>
                </div>

                <div className="eval-spec-item">
                  <div className="eval-spec-icon"><IconClock size={20} /></div>
                  <div>
                    <div className="eval-spec-lbl">Durasi Pengerjaan</div>
                    <div className="eval-spec-val">{quiz.duration ? `${quiz.duration} Menit` : 'Fleksibel'}</div>
                  </div>
                </div>

                <div className="eval-spec-item">
                  <div className="eval-spec-icon"><IconCheck size={20} /></div>
                  <div>
                    <div className="eval-spec-lbl">Tipe Soal</div>
                    <div className="eval-spec-val">Pilihan Ganda</div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="eval-rules-box">
                <div className="eval-rules-title">
                  <IconShield size={16} />
                  <span>Petunjuk Pengerjaan:</span>
                </div>
                <ul className="eval-rules-list">
                  <li>Pilihlah salah satu jawaban yang paling tepat dengan mengklik opsi A, B, C, atau D.</li>
                  <li>Gunakan tombol <strong>Tandai Ragu</strong> untuk menandai soal yang ingin diperiksa kembali.</li>
                  <li>Anda dapat berpindah nomor soal kapan saja melalui navigasi nomor.</li>
                  <li>Jawaban akan otomatis dikumpulkan dan dinilai saat waktu pengerjaan selesai.</li>
                </ul>
              </div>

              {/* Identity Form */}
              <div className="eval-identity-form">
                <label className="eval-form-label" htmlFor="eval_name_input">
                  Nama Peserta (Tertera pada Lembar Laporan &amp; Rekap Nilai):
                </label>
                <input
                  id="eval_name_input"
                  type="text"
                  className="eval-name-input"
                  placeholder="Masukkan nama lengkap Anda (Contoh: Putu Arya Wijaya)..."
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                />
              </div>

              <button type="button" className="eval-start-btn" onClick={handleStart}>
                <span>Mulai Pengerjaan Kuis</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. ACTIVE EXAM WORKSPACE
  // ==========================================
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const selectedOption = answers[currentQuestion.id];
  const isBookmarked = Boolean(bookmarked[currentQuestion.id]);
  const timerActive = quiz && quiz.duration;
  const timerStatusClass = secondsLeft <= 60 ? 'timer-critical' : secondsLeft <= 300 ? 'timer-warning' : '';

  // Palette Grid Content helper (reused on desktop sidebar and mobile drawer)
  const renderPaletteContent = () => (
    <>
      <div className="eval-legend-wrap">
        <div className="eval-legend-item">
          <span><span className="eval-legend-dot dot-green" /> Sudah Dijawab</span>
          <strong style={{ color: '#0f172a' }}>{answeredCount}</strong>
        </div>
        <div className="eval-legend-item">
          <span><span className="eval-legend-dot dot-amber" /> Ragu-ragu</span>
          <strong style={{ color: '#0f172a' }}>{bookmarkedCount}</strong>
        </div>
        <div className="eval-legend-item">
          <span><span className="eval-legend-dot dot-gray" /> Belum Dijawab</span>
          <strong style={{ color: '#0f172a' }}>{remainingCount}</strong>
        </div>
      </div>

      <div className="eval-numbers-grid">
        {questions.map((q, idx) => {
          const isAns = Boolean(answers[q.id]);
          const isMarked = Boolean(bookmarked[q.id]);
          const isActive = idx === currentIndex;

          let cls = 'eval-num-btn';
          if (isActive) cls += ' num-active';
          if (isMarked) cls += ' num-flagged';
          else if (isAns) cls += ' num-answered';

          return (
            <button
              type="button"
              key={q.id}
              className={cls}
              onClick={() => handleJumpTo(idx)}
              title={`Lompat ke Soal No. ${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="eval-btn-finish-sidebar"
        onClick={() => setIsConfirmModalOpen(true)}
        disabled={submitting}
      >
        {submitting ? 'Mengirim...' : 'Selesaikan Kuis'}
      </button>
    </>
  );

  return (
    <div className="eval-page-wrap">
      <AmbientBackdrop />
      <div className="eval-container">

        {/* Top Navbar */}
        <header className="eval-navbar">
          <div className="eval-nav-left">
            <span className="eval-logo-badge">GENRE QUIZ</span>
            <div style={{ minWidth: 0 }}>
              <div className="eval-title-text">{quiz.title}</div>
              <div className="eval-participant-text">
                Peserta: <strong>{participantName.trim() || 'Peserta Mandiri'}</strong>
              </div>
            </div>
          </div>

          <div className="eval-nav-right">
            {timerActive && (
              <div className={`eval-timer-box ${timerStatusClass}`} title="Sisa Waktu Pengerjaan">
                <IconClock size={15} />
                <span className="eval-timer-digits">{formatTime(secondsLeft)}</span>
              </div>
            )}
          </div>
        </header>

        {/* Main 2-Column Grid */}
        <main className="eval-workspace-grid">

          {/* Left: Question Sheet */}
          <section className="eval-question-sheet" aria-label="Lembar Soal Kuis">
            <div className="eval-sheet-top">
              <div className="eval-q-badge">
                <span>SOAL NO. {currentIndex + 1}</span>
                <span style={{ color: '#94a3b8' }}>/ {questions.length}</span>
              </div>

              {/* Font Size Adjusters */}
              <div className="eval-font-controls">
                <span className="eval-font-lbl">Teks:</span>
                <button
                  type="button"
                  className={`eval-font-btn ${fontSize === 'normal' ? 'active' : ''}`}
                  onClick={() => setFontSize('normal')}
                >
                  A
                </button>
                <button
                  type="button"
                  className={`eval-font-btn ${fontSize === 'large' ? 'active' : ''}`}
                  onClick={() => setFontSize('large')}
                >
                  A+
                </button>
                <button
                  type="button"
                  className={`eval-font-btn ${fontSize === 'xlarge' ? 'active' : ''}`}
                  onClick={() => setFontSize('xlarge')}
                >
                  A++
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className={`eval-question-text font-size-${fontSize}`}>
              {currentQuestion.question}
            </div>

            {/* Options List */}
            <div className="eval-options-list" role="radiogroup" aria-label="Pilihan Jawaban">
              {currentQuestion.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedOption === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    className={`eval-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectAnswer(currentQuestion.id, opt.id)}
                    role="radio"
                    aria-checked={isSelected}
                  >
                    <span className="eval-option-key">{letter}</span>
                    <span className="eval-option-text">{opt.option_text}</span>
                    <span className="eval-option-radio-dot" />
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="eval-sheet-actions">
              <button
                type="button"
                className="eval-btn-prev"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                &larr; Sebelumnya
              </button>

              <button
                type="button"
                className={`eval-btn-flag ${isBookmarked ? 'flagged' : ''}`}
                onClick={() => handleToggleBookmark(currentQuestion.id)}
              >
                <IconBookmark size={15} filled={isBookmarked} />
                <span>{isBookmarked ? 'Hapus Ragu' : 'Tandai Ragu'}</span>
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  className="eval-btn-next"
                  onClick={handleNext}
                >
                  Berikutnya &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  className="eval-btn-submit"
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={submitting}
                >
                  Selesai &amp; Kumpulkan &check;
                </button>
              )}
            </div>
          </section>

          {/* Right: Lembar Nomor Soal (Desktop Sidebar) */}
          <aside className="eval-palette-card" aria-label="Navigasi Nomor Soal">
            <div className="eval-palette-header">
              <span>Nomor Soal</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                {answeredCount} / {questions.length} Terjawab
              </span>
            </div>
            {renderPaletteContent()}
          </aside>
        </main>
      </div>

      {/* Mobile Floating Trigger for Question Numbers */}
      <div className="eval-mobile-dock">
        <button
          type="button"
          className="eval-mobile-palette-btn"
          onClick={() => setIsMobilePaletteOpen(true)}
        >
          <IconGrid size={16} />
          <span>Nomor Soal</span>
          <span className="palette-pill">{currentIndex + 1}/{questions.length}</span>
        </button>
      </div>

      {/* Mobile Palette Modal Drawer */}
      <Modal
        isOpen={isMobilePaletteOpen}
        onClose={() => setIsMobilePaletteOpen(false)}
        title="Daftar Nomor Soal"
        size="small"
      >
        <div style={{ padding: '8px 0' }}>
          {renderPaletteContent()}
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Konfirmasi Pengumpulan Jawaban"
        size="medium"
      >
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#f0fdf4',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            border: '1px solid #bbf7d0'
          }}>
            <IconFileCheck size={24} />
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Kumpulkan Lembar Jawaban Kuis?
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 16px' }}>
            Pastikan seluruh pertanyaan telah diperiksa sebelum mengirimkan lembar jawaban.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, display: 'block' }}>DIJAWAB</span>
              <strong style={{ fontSize: '1.2rem', color: '#16a34a' }}>{answeredCount}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, display: 'block' }}>RAGU-RAGU</span>
              <strong style={{ fontSize: '1.2rem', color: '#f59e0b' }}>{bookmarkedCount}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, display: 'block' }}>BELUM DIISI</span>
              <strong style={{ fontSize: '1.2rem', color: '#dc2626' }}>{remainingCount}</strong>
            </div>
          </div>

          {remainingCount > 0 && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#991b1b',
              fontSize: '0.8rem',
              marginBottom: '16px'
            }}>
              Perhatian: Masih ada <strong>{remainingCount} butir soal</strong> yang belum Anda jawab.
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Periksa Kembali
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSubmit()}
              disabled={submitting}
            >
              {submitting ? 'Mengirim...' : 'Ya, Kumpulkan Sekarang'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizDetail;

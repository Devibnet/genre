import { Link } from 'react-router-dom';

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const QuizCard = ({ quiz }) => {
  const { id, title, description, thumbnail_url, duration, article_title } = quiz;

  return (
    <div className="quiz-card">
      {/* Media or Illustration Frame */}
      {thumbnail_url ? (
        <div className="quiz-card-img-wrap">
          <img src={thumbnail_url} alt={title} loading="lazy" />
          <span className="quiz-card-badge-floating">Kuis GenRe</span>
        </div>
      ) : (
        <div className="quiz-card-pattern-banner">
          <span className="quiz-card-tag-pill">
            {article_title ? 'Materi Terkait' : 'Kuis Umum'}
          </span>
        </div>
      )}

      <div className="quiz-card-body">
        <h3 className="quiz-card-title" title={title}>{title}</h3>
        <p className="quiz-card-desc">
          {description || 'Uji dan ukur seberapa mendalam pemahamanmu tentang materi edukasi ini.'}
        </p>

        <div className="quiz-card-footer">
          <div className="quiz-card-duration">
            <ClockIcon />
            <span>{duration ? `${duration} Menit` : 'Durasi Bebas'}</span>
          </div>

          <Link to={`/quiz/${id}`} className="quiz-card-start-btn">
            <span>Mulai Kuis</span>
            <span className="quiz-card-start-arrow">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;

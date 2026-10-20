import jsPDF from 'jspdf';

/**
 * Generates an official, structured, and beautifully styled PDF report for Quiz results.
 * @param {Object} params
 * @param {string} params.userName - Participant Name / Inisial
 * @param {Object} params.quiz - Quiz details (title, description, duration)
 * @param {Object} params.result - Graded submission result (score, total_questions, percentage, results)
 * @param {Array} params.questions - Original question list with options
 * @param {Object} params.userAnswers - User selected answers map { question_id: option_id }
 */
export const generateQuizReportPDF = ({
  userName = 'Peserta GenRe',
  quiz,
  result,
  questions = [],
  userAnswers = {},
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Helper colors
  const PRIMARY_DARK = [4, 49, 25]; // #043119
  const PRIMARY_GREEN = [20, 83, 45]; // #14532d
  const ACCENT_GREEN = [22, 163, 74]; // #16a34a
  const ACCENT_GOLD = [217, 119, 6]; // #d97706
  const SLATE_DARK = [15, 23, 42]; // #0f172a
  const SLATE_MUTED = [71, 85, 105]; // #475569
  const SLATE_LIGHT = [241, 245, 249]; // #f1f5f9
  const RED_ERROR = [220, 38, 38];

  // Helper check new page
  const ensureSpace = (neededHeight) => {
    if (cursorY + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      cursorY = margin;
      drawHeaderWatermark();
    }
  };

  const drawHeaderWatermark = () => {
    // Top colored slim line
    doc.setFillColor(...ACCENT_GREEN);
    doc.rect(0, 0, pageWidth, 4, 'F');
  };

  // Draw Page 1 Top Border
  drawHeaderWatermark();

  // 1. INSTITUTIONAL HEADER (KOP RESMI)
  doc.setFillColor(...PRIMARY_DARK);
  doc.rect(margin, cursorY, contentWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('FORUM GENRE KABUPATEN BULELENG', margin + 8, cursorY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 230, 210);
  doc.text(
    'Dinas Pemberdayaan Masyarakat dan Desa, Pengendalian Penduduk dan KB (DPMDPPKB)',
    margin + 8,
    cursorY + 16
  );
  doc.text(
    'Lembaga Edukasi & Konseling Remaja Sebaya | Website Resmi: genre-buleleng.id',
    margin + 8,
    cursorY + 21
  );

  cursorY += 32;

  // 2. DOCUMENT TITLE & META CARD
  doc.setTextColor(...PRIMARY_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('LAPORAN HASIL EVALUASI PEMAHAMAN QUIZ', margin, cursorY);

  cursorY += 6;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, margin + contentWidth, cursorY);
  cursorY += 6;

  // Participant & Quiz Info Box
  doc.setFillColor(...SLATE_LIGHT);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'F');

  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE_MUTED);

  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text('Nama Peserta:', margin + 6, cursorY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SLATE_DARK);
  doc.text(userName || 'Peserta Mandiri', margin + 35, cursorY + 7);

  doc.setTextColor(...SLATE_MUTED);
  doc.setFont('helvetica', 'bold');
  doc.text('Modul Quiz:', margin + 6, cursorY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SLATE_DARK);
  const quizTitle = doc.splitTextToSize(quiz?.title || 'Quiz Edukasi GenRe', 80);
  doc.text(quizTitle, margin + 35, cursorY + 14);

  // Right column
  const colRightX = margin + 110;
  doc.setTextColor(...SLATE_MUTED);
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Pengerjaan:', colRightX, cursorY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SLATE_DARK);
  const nowStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(nowStr, colRightX + 32, cursorY + 7);

  doc.setTextColor(...SLATE_MUTED);
  doc.setFont('helvetica', 'bold');
  doc.text('Durasi Pengerjaan:', colRightX, cursorY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SLATE_DARK);
  doc.text(quiz?.duration ? `${quiz.duration} Menit` : 'Waktu Bebas', colRightX + 32, cursorY + 14);

  cursorY += 30;

  // 3. SCORE & PERFORMANCE SUMMARY HIGHLIGHT
  const scoreBoxWidth = (contentWidth - 8) / 3;
  const percentage = result?.percentage || 0;
  const score = result?.score || 0;
  const total = result?.total_questions || questions.length || 0;

  let gradeLabel = 'Perlu Belajar Lagi';
  let gradeColor = RED_ERROR;
  if (percentage >= 80) {
    gradeLabel = 'Sangat Memuaskan';
    gradeColor = PRIMARY_GREEN;
  } else if (percentage >= 60) {
    gradeLabel = 'Cukup Baik';
    gradeColor = ACCENT_GOLD;
  }

  // Box 1: Score
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, cursorY, scoreBoxWidth, 20, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY_GREEN);
  doc.text('SKOR AKHIR', margin + 6, cursorY + 6);
  doc.setFontSize(16);
  doc.text(`${percentage}%`, margin + 6, cursorY + 15);

  // Box 2: Accuracy
  const box2X = margin + scoreBoxWidth + 4;
  doc.setFillColor(...SLATE_LIGHT);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(box2X, cursorY, scoreBoxWidth, 20, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(...SLATE_MUTED);
  doc.text('KETEPATAN JAWABAN', box2X + 6, cursorY + 6);
  doc.setFontSize(13);
  doc.setTextColor(...SLATE_DARK);
  doc.text(`${score} dari ${total} Soal Benar`, box2X + 6, cursorY + 14);

  // Box 3: Evaluation
  const box3X = margin + (scoreBoxWidth + 4) * 2;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(box3X, cursorY, scoreBoxWidth, 20, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT_GOLD);
  doc.text('PREDIKAT EVALUASI', box3X + 6, cursorY + 6);
  doc.setFontSize(11);
  doc.setTextColor(...gradeColor);
  doc.text(gradeLabel, box3X + 6, cursorY + 14);

  cursorY += 28;

  // 4. DETAILED BREAKDOWN PER QUESTION
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...SLATE_DARK);
  doc.text('PEMBAHASAN & EVALUASI BUTIR SOAL', margin, cursorY);
  cursorY += 6;

  // Map of questions from result
  const detailedResults = result?.results || [];

  questions.forEach((q, idx) => {
    // Find grading result
    const qResult = detailedResults.find((r) => String(r.question_id) === String(q.id));
    const isCorrect = qResult ? qResult.is_correct : false;
    const selectedOptId = userAnswers[q.id] || (qResult ? qResult.selected_option_id : null);
    const correctOptId = qResult ? qResult.correct_option_id : null;

    const selectedOpt = q.options?.find((o) => String(o.id) === String(selectedOptId));
    const correctOpt = q.options?.find((o) => String(o.id) === String(correctOptId));

    // Calculate needed height for this question card
    const qLines = doc.splitTextToSize(`${idx + 1}. ${q.question}`, contentWidth - 12);
    let cardHeight = 16 + qLines.length * 4.5;
    if (selectedOpt) cardHeight += 6;
    if (!isCorrect && correctOpt) cardHeight += 6;
    if (q.explanation) {
      const expLines = doc.splitTextToSize(`Pembahasan: ${q.explanation}`, contentWidth - 16);
      cardHeight += 6 + expLines.length * 4;
    }

    ensureSpace(cardHeight + 4);

    // Question box background
    doc.setFillColor(isCorrect ? 240 : 254, isCorrect ? 253 : 242, isCorrect ? 244 : 242);
    doc.setDrawColor(isCorrect ? 187 : 254, isCorrect ? 247 : 202, isCorrect ? 208 : 202);
    doc.roundedRect(margin, cursorY, contentWidth, cardHeight, 2, 2, 'FD');

    let internalY = cursorY + 6;

    // Status Pill
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    if (isCorrect) {
      doc.setTextColor(...PRIMARY_GREEN);
      doc.text('[ BENAR ]', margin + contentWidth - 22, internalY);
    } else {
      doc.setTextColor(...RED_ERROR);
      doc.text('[ KURANG TEPAT ]', margin + contentWidth - 32, internalY);
    }

    // Question Text
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_DARK);
    doc.setFont('helvetica', 'bold');
    doc.text(qLines, margin + 6, internalY);
    internalY += qLines.length * 4.5 + 2;

    // User Answer
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_MUTED);
    doc.text('Jawaban Anda: ', margin + 6, internalY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isCorrect ? PRIMARY_GREEN[0] : RED_ERROR[0], isCorrect ? PRIMARY_GREEN[1] : RED_ERROR[1], isCorrect ? PRIMARY_GREEN[2] : RED_ERROR[2]);
    doc.text(selectedOpt ? selectedOpt.option_text : '(Tidak Dijawab)', margin + 30, internalY);
    internalY += 5.5;

    // Correct Answer if user wrong
    if (!isCorrect && correctOpt) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE_MUTED);
      doc.text('Kunci Jawaban: ', margin + 6, internalY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PRIMARY_GREEN);
      doc.text(correctOpt.option_text, margin + 30, internalY);
      internalY += 5.5;
    }

    // Explanation Box if available
    if (q.explanation) {
      const expLines = doc.splitTextToSize(`Info Edukasi: ${q.explanation}`, contentWidth - 16);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin + 4, internalY - 1, contentWidth - 8, expLines.length * 4 + 4, 1.5, 1.5, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...SLATE_MUTED);
      doc.text(expLines, margin + 7, internalY + 3);
    }

    cursorY += cardHeight + 4;
  });

  // 5. OFFICIAL SIGNATURE & CLOSING
  ensureSpace(38);
  cursorY += 6;

  const signX = margin + contentWidth - 65;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SLATE_DARK);
  doc.text('Singaraja, Bali', signX, cursorY);
  doc.text('Pusat Informasi & Konseling Remaja', signX, cursorY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text('Forum GenRe Kabupaten Buleleng', signX, cursorY + 10);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...SLATE_MUTED);
  doc.text('[ Dokumen Resmi Terverifikasi Sistem ]', signX, cursorY + 24);

  // Footer for all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_MUTED);
    doc.text(
      `Laporan Hasil Quiz GenRe Buleleng — Dokumen ID: GENRE-${(quiz?.id || 'QZ').substring(0, 8).toUpperCase()}`,
      margin,
      pageHeight - 8
    );
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin - 22, pageHeight - 8);
  }

  // Save the PDF
  const safeFilename = `Laporan_Hasil_Quiz_${(quiz?.title || 'GenRe').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(safeFilename);
};

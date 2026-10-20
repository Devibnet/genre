/**
 * Generates a pre-filled WhatsApp link for counseling.
 * Converts local Indonesian numbers (starting with 0) to country code 62.
 */
export const buildWhatsAppLink = (phoneNumber, userName, story, counselorName = '') => {
  if (!phoneNumber) return '';

  // Clean the phone number (remove spaces, symbols)
  let cleanNumber = phoneNumber.replace(/[\s\-\+\(\)]/g, '');

  // Convert leading 0 to 62 (Indonesian country code)
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.substring(1);
  }

  // Pre-filled message sesuai format yang diminta
  const kakName = counselorName ? `Kak ${counselorName}` : 'Kak Konselor';
  const message = `Om Swastiastu, ${kakName}.

Perkenalkan, saya ${userName}.

Saya ingin melakukan konseling dan ingin bercerita mengenai:

${story}

Terima kasih, Kak.`;

  // URL encode the message text
  const encodedText = encodeURIComponent(message);

  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
};

/**
 * Formats an ISO date string into Indonesian human-readable format.
 * Example: '2026-08-10T07:04:12' -> '10 Agustus 2026'
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch (error) {
    return dateString;
  }
};

/**
 * Formats date and time.
 * Example: '2026-08-10T07:04:12' -> '10 Agustus 2026, 14:04'
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const formattedDate = formatDate(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${formattedDate}, ${hours}:${minutes}`;
  } catch (error) {
    return dateString;
  }
};

/**
 *
 * @returns now date formatted
 */
export function getFormattedDateTime(date?: string) {
  const now = date ? new Date(date) : new Date();

  const options = {
    weekday: "long", // martes
    day: "numeric", // 29
    month: "long", // julio
    year: "numeric", // 2025
    hour: "numeric", // 3
    minute: "2-digit", // 42
    hour12: true, // PM
  };

  return now.toLocaleString(
    navigator.language || "es-ES",
    options as Intl.DateTimeFormatOptions
  );
}

/**
 * Returns date formatted as: dd/mm/yy hh:mm
 */
export function getShortFormattedDateTime(date?: string) {
  const d = date ? new Date(date) : new Date();

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 *
 * @param isoString iso string date
 * @returns formated date for input
 */
export function formatForDatetimeLocal(isoString?: string) {
  const date = isoString ? new Date(isoString) : new Date();

  // Extraer los componentes
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

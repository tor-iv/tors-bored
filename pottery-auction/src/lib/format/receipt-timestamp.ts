// YYYY-MM-DD  HH:MM:SS — two spaces between date and time per DESIGN_RECEIPT.md §6.3
export function formatReceiptTimestamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins  = String(d.getMinutes()).padStart(2, '0');
  const secs  = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}  ${hours}:${mins}:${secs}`;
}

export function formatReceiptDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

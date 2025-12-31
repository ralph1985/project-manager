export function fmtNumber(value) {
  return Number.isFinite(value)
    ? value.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
    : '—';
}

export function fmtCurrency(value) {
  return Number.isFinite(value)
    ? value.toLocaleString('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : '—';
}

export function formatTickTickDate(value) {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return 'Sin fecha';
  return parsed.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

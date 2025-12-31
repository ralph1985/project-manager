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
  let parsed = null;
  if (value.includes('/')) {
    const parts = value.split('/').map(Number);
    if (parts.length === 3 && !Number.isNaN(parts[2])) {
      parsed = new Date(parts[2], parts[1] - 1, parts[0]);
    }
  } else {
    parsed = new Date(value);
  }
  if (!parsed) return 'Sin fecha';
  if (Number.isNaN(parsed.valueOf())) return 'Sin fecha';
  return parsed.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

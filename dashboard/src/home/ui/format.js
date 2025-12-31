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
  const parsed = parseTickTickDate(value);
  if (!parsed || Number.isNaN(parsed.valueOf())) return 'Sin fecha';
  return parsed.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

export function parseTickTickDate(value) {
  if (!value) return null;
  if (value.includes('/')) {
    const parts = value.split('/').map(Number);
    if (parts.length === 3 && !Number.isNaN(parts[2])) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
  let normalized = value;
  if (typeof value === 'string' && /[+-]\d{4}$/.test(value)) {
    normalized = value.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
  }
  return new Date(normalized);
}

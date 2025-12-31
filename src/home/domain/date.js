export function parseDate(value) {
  if (!value) return 0;
  const parts = value.split('/').map(Number);
  if (parts.length !== 3 || Number.isNaN(parts[2])) return 0;
  return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
}

export function toDisplayDate(inputValue) {
  if (!inputValue) return '';
  const [yyyy, mm, dd] = inputValue.split('-');
  if (!yyyy || !mm || !dd) return '';
  return `${dd}/${mm}/${yyyy}`;
}

export function parseInputDate(inputValue, fallback) {
  if (!inputValue) return fallback;
  return parseDate(toDisplayDate(inputValue));
}

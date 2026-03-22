export const HOURLY_RATE = 50;
export const FILTER_KEY = 'pm-filters';
export const TICKTICK_KEY = 'pm-ticktick-project';
export const DEFAULT_TICKTICK_PROJECT_ID = '68f4a63ddfc6de000000024d';
export const TICKTICK_NOT_SECTIONED_COLUMN_ID = '68f4a64edfc6de0000000261';

function normalizeBasePath(value) {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, '');
}

export const BASE_PATH = normalizeBasePath(
  document.querySelector('meta[name="pm:base-path"]')?.content || ''
);

export function withBase(pathname = '/') {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${BASE_PATH}${path}`;
}

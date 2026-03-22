import { DATE_LOCALE } from './constants';

export function formatDisplayDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString(DATE_LOCALE, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString(DATE_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

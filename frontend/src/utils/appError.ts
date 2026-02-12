/**
 * Единый формат сообщения об ошибке для тестировщиков.
 * По коду [CODE] можно быстро найти место в коде и понять контекст.
 * Сообщение показывается пользователю и его можно скопировать в отчёт.
 */
export const APP_ERROR_PREFIX = 'Chess App Error:';

export function formatAppError(code: string, message: string): string {
  return `${APP_ERROR_PREFIX} [${code}] — ${message}`;
}

import { errorMessagesEn } from './messages.en';
import { errorMessagesPt } from './messages.pt';
import type { ErrorMessageKey, ErrorMessages } from './messages.pt';

export type I18nLocale = 'pt' | 'en';
export type MessageParams = Record<string, string | number>;

const DEFAULT_LOCALE: I18nLocale = 'pt';

const ERROR_MESSAGES_BY_LOCALE: Record<I18nLocale, ErrorMessages> = {
  pt: errorMessagesPt,
  en: errorMessagesEn,
};

let forcedLocale: I18nLocale | null = null;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeLocale(locale?: string | null): I18nLocale {
  if (!locale) return DEFAULT_LOCALE;

  const normalized = locale.toLowerCase();
  if (normalized.startsWith('en')) return 'en';
  if (normalized.startsWith('pt')) return 'pt';

  return DEFAULT_LOCALE;
}

export function setI18nLocale(locale: string): void {
  forcedLocale = normalizeLocale(locale);
}

export function clearI18nLocale(): void {
  forcedLocale = null;
}

export function getCurrentLocale(locale?: string): I18nLocale {
  if (locale) return normalizeLocale(locale);
  if (forcedLocale) return forcedLocale;

  if (typeof document !== 'undefined' && typeof document.documentElement?.lang === 'string') {
    return normalizeLocale(document.documentElement.lang);
  }

  if (typeof navigator !== 'undefined' && typeof navigator.language === 'string') {
    return normalizeLocale(navigator.language);
  }

  return DEFAULT_LOCALE;
}

function interpolateMessage(template: string, params?: MessageParams): string {
  if (!params) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{{${key}}}` : String(value);
  });
}

export function getMessage(
  key: string | ErrorMessageKey,
  options?: {
    locale?: string;
    params?: MessageParams;
  },
): string {
  const locale = getCurrentLocale(options?.locale);
  const dictionary = ERROR_MESSAGES_BY_LOCALE[locale] as Record<string, string>;
  const message = dictionary[key];

  if (message) {
    return interpolateMessage(message, options?.params);
  }

  return interpolateMessage(dictionary.UNKNOWN_ERROR_CODE, { code: key });
}

function translateKnownMessageOrKeepRaw(message: string, locale?: string): string {
  const currentLocale = getCurrentLocale(locale);
  const dictionary = ERROR_MESSAGES_BY_LOCALE[currentLocale] as Record<string, string>;

  if (dictionary[message]) {
    return dictionary[message];
  }

  return message;
}

function extractStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function getErrorMessage(error: unknown, options?: { locale?: string }): string {
  const locale = getCurrentLocale(options?.locale);
  const dictionary = ERROR_MESSAGES_BY_LOCALE[locale];

  if (typeof error === 'string') {
    return translateKnownMessageOrKeepRaw(error, locale);
  }

  if (isObject(error)) {
    const topLevelErrors = extractStringArray(error.errors);
    if (topLevelErrors.length > 0) {
      return topLevelErrors.map((code) => getMessage(code, { locale })).join(', ');
    }

    if (isObject(error.response)) {
      const data = error.response.data;

      if (isObject(data)) {
        const dataErrors = extractStringArray(data.errors);
        if (dataErrors.length > 0) {
          return dataErrors.map((code) => getMessage(code, { locale })).join(', ');
        }

        const dataMessages = extractStringArray(data.message);
        if (dataMessages.length > 0) {
          return dataMessages.map((message) => translateKnownMessageOrKeepRaw(message, locale)).join(', ');
        }

        if (typeof data.message === 'string') {
          return translateKnownMessageOrKeepRaw(data.message, locale);
        }
      }
    }
  }

  if (error instanceof Error) {
    return translateKnownMessageOrKeepRaw(error.message, locale);
  }

  return dictionary.DEFAULT_API_ERROR;
}

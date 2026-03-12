import { getErrorMessage, getMessage } from '../../../i18n';

export function formatRequiredError(): { type: string; message: string } {
  return {
    type: 'required',
    message: getErrorMessage({ errors: ['REQUIRED_FIELD'] }),
  };
}

export function refinementValidationError(message: string): {
  type: string;
  message: string;
} {
  return {
    type: 'refinement',
    message,
  };
}

export function formatValidationError(errors?: string[]): {
  type: string;
  message: string;
} {
  return {
    type: 'validation',
    message: getErrorMessage({ errors }) || getMessage('INVALID_VALUE'),
  };
}

export function formatInvalidTypeError(message: string): {
  type: string;
  message: string;
} {
  return { type: 'invalid_type', message };
}

export function formatMinError(min: number): { type: string; message: string } {
  return {
    type: 'min',
    message: getMessage('MIN_ITEMS', { params: { min } }),
  };
}

export function formatMaxError(max: number): { type: string; message: string } {
  return {
    type: 'max',
    message: getMessage('MAX_ITEMS', { params: { max } }),
  };
}

import { Result, ResultValidator } from '../../src';

describe('ResultValidator', () => {
  test('should throw in throwsIfTrue when source instance is truthy', () => {
    const validator = new ResultValidator({ instance: true, isFailure: false });

    expect(() => validator.throwsIfTrue('ERR_TRUE')).toThrow('ERR_TRUE');
  });

  test('should not throw in throwsIfTrue when source instance is falsy', () => {
    const validator = new ResultValidator({ instance: false, isFailure: false });

    expect(() => validator.throwsIfTrue()).not.toThrow();
  });

  test('should throw in throwsIfFalse when source instance is falsy', () => {
    const validator = new ResultValidator({ instance: false, isFailure: false });

    expect(() => validator.throwsIfFalse('ERR_FALSE')).toThrow('ERR_FALSE');
  });

  test('should throw in throwsIfNull when source instance is null', () => {
    const validator = new ResultValidator({
      instance: null,
      isFailure: false,
    });

    expect(() => validator.throwsIfNull('ERR_NULL')).toThrow('ERR_NULL');
  });

  test('should throw in throwsIfNotNull when source instance exists', () => {
    const validator = new ResultValidator({
      instance: 'value',
      isFailure: false,
    });

    expect(() => validator.throwsIfNotNull('ERR_NOT_NULL')).toThrow('ERR_NOT_NULL');
  });

  test('should not throw in throwsIfNotNull when source instance is null', () => {
    const validator = new ResultValidator({
      instance: null,
      isFailure: false,
    });

    expect(() => validator.throwsIfNotNull()).not.toThrow();
  });

  test('should throw in throwsIfEmpty for empty arrays', () => {
    const validator = new ResultValidator({ instance: [], isFailure: false });

    expect(() => validator.throwsIfEmpty('ERR_EMPTY')).toThrow('ERR_EMPTY');
  });

  test('should not throw in throwsIfEmpty for non-empty arrays', () => {
    const validator = new ResultValidator({
      instance: ['x'],
      isFailure: false,
    });

    expect(() => validator.throwsIfEmpty()).not.toThrow();
  });

  test('should throw in throwsIfNotEmpty for non-empty arrays', () => {
    const validator = new ResultValidator({
      instance: ['x'],
      isFailure: false,
    });

    expect(() => validator.throwsIfNotEmpty('ERR_NOT_EMPTY')).toThrow('ERR_NOT_EMPTY');
  });

  test('should throw in throwsIfFailed using source errors by default', () => {
    const validator = new ResultValidator({
      instance: undefined,
      isFailure: true,
      errors: ['E1', 'E2'],
    });

    expect(() => validator.throwsIfFailed()).toThrow('E1, E2');
  });

  test('should throw the same Error instance when Error is provided', () => {
    const validator = new ResultValidator({ instance: true, isFailure: false });
    const expectedError = new Error('ERR_INSTANCE');

    try {
      validator.throwsIfTrue(expectedError);
      throw new Error('SHOULD_HAVE_THROWN');
    } catch (error) {
      expect(error).toBe(expectedError);
    }
  });

  test('should use custom exception factory when provided', () => {
    const validator = new ResultValidator({ instance: true, isFailure: false });

    expect(() => validator.throwsIfTrue('CHAINED', (error) => new TypeError(String(error)))).toThrow(TypeError);
  });

  test('should return source in fluent get result', () => {
    const result = Result.ok(true);

    const validatedResult = result.validator.throwsIfFalse().result;

    expect(validatedResult).toBe(result);
    expect(validatedResult.isOk).toBe(true);
  });

  test('should not throw when validation conditions are not matched', () => {
    const validator = new ResultValidator({ instance: true, isFailure: false });

    expect(() => validator.throwsIfFalse().throwsIfNull().throwsIfNotEmpty()).not.toThrow();
  });
});

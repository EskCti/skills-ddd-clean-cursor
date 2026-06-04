import { Result } from '../../src';

describe('Result', () => {
  test('should create ok result with instance', () => {
    const result = Result.ok('value');

    expect(result.isOk).toBe(true);
    expect(result.isFailure).toBe(false);
    expect(result.instance).toBe('value');
  });

  test('should create ok result with null when instance is undefined', () => {
    const result = Result.ok();

    expect(result.isOk).toBe(true);
    expect(result.instance).toBeNull();
    expect(result.errors).toEqual([]);
  });

  test('should create failed result from string', () => {
    const result = Result.fail('ERR');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toEqual(['ERR']);
  });

  test('should create failed result from string array', () => {
    const result = Result.fail(['E1', 'E2']);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toEqual(['E1', 'E2']);
  });

  test('should use fallback error wrapper when fail receives non-array value', () => {
    const result = Result.fail(123 as unknown as string);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toEqual([123]);
  });

  test('should return RESULT_UNDEFINED when no instance and no explicit errors', () => {
    const result = new Result<string>(undefined, []);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toEqual(['RESULT_UNDEFINED']);
  });

  test('should throw errors when throwsIfFailed is called on failure', () => {
    const result = Result.fail('ERR');

    expect(() => result.validator.throwsIfFailed()).toThrow();
  });

  test('should not throw when throwsIfFailed is called on success', () => {
    const result = Result.ok('ok');

    expect(() => result.validator.throwsIfFailed()).not.toThrow();
  });

  test('should return failed result with withFail', () => {
    const result = Result.fail('ERR');
    const failed = result.withFail;

    expect(failed.isFailure).toBe(true);
    expect(failed.errors).toEqual(['ERR']);
  });

  test('should execute trySync with success', () => {
    const result = Result.trySync(() => 'done');

    expect(result.isOk).toBe(true);
    expect(result.instance).toBe('done');
  });

  test('should execute trySync with failure', () => {
    const result = Result.trySync(() => {
      throw 'SYNC_ERR';
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors).toEqual(['SYNC_ERR']);
  });

  test('should execute trySync with Error failure and map to message', () => {
    const result = Result.trySync(() => {
      throw new Error('SYNC_ERR_OBJECT');
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors).toEqual(['SYNC_ERR_OBJECT']);
  });

  test('should execute trySync with Result return and avoid nested Result', () => {
    const result = Result.trySync(() => Result.ok('sync-done'));

    expect(result.isOk).toBe(true);
    expect(result.instance).toBe('sync-done');
  });

  test('should execute try with success', async () => {
    const result = await Result.try(async () => Result.ok('done'));

    expect(result.isOk).toBe(true);
    expect(result.instance).toBe('done');
  });

  test('should execute try with plain value and wrap in ok', async () => {
    const result = await Result.try(async () => 'done');

    expect(result.isOk).toBe(true);
    expect(result.instance).toBe('done');
  });

  test('should execute try with void callback and return ok', async () => {
    const result = await Result.try(async () => {});

    expect(result.isOk).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('should execute try with failure', async () => {
    const result = await Result.try(async () => {
      throw 'ASYNC_ERR';
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors).toEqual(['ASYNC_ERR']);
  });

  test('should execute try with Error failure and map to message', async () => {
    const result = await Result.try(async () => {
      throw new Error('ASYNC_ERR_OBJECT');
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors).toEqual(['ASYNC_ERR_OBJECT']);
  });

  test('should combine successful results', () => {
    const result = Result.combine([Result.ok('a'), Result.ok(2)] as const);

    expect(result.isOk).toBe(true);
    expect(result.instance).toEqual(['a', 2]);
  });

  test('should combine failed results and aggregate errors', () => {
    const result = Result.combine([Result.ok('a'), Result.fail('E1'), Result.fail(['E2', 'E3'])]);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toEqual(['E1', 'E2', 'E3']);
  });

  test('should combineAsync successful results', async () => {
    const result = await Result.combineAsync([Promise.resolve(Result.ok('a')), Promise.resolve(Result.ok('b'))]);

    expect(result.isOk).toBe(true);
    expect(result.instance).toEqual(['a', 'b']);
  });

  test('should combineAsync failed results', async () => {
    const result = await Result.combineAsync([Promise.resolve(Result.ok('a')), Promise.resolve(Result.fail('E1'))]);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toEqual(['E1']);
  });

  test('should throw when validator.throwsIfTrue for truthy boolean instance', () => {
    const result = Result.ok(true);

    expect(() => result.validator.throwsIfTrue('ERR_TRUE')).toThrow('ERR_TRUE');
  });

  test('should throw when validator.throwsIfFalse for falsy boolean instance', () => {
    const result = Result.ok(false);

    expect(() => result.validator.throwsIfFalse('ERR_FALSE')).toThrow('ERR_FALSE');
  });

  test('should throw when validator.throwsIfNull for null instance', () => {
    const result = Result.ok<string>();

    expect(() => result.validator.throwsIfNull('ERR_NULL')).toThrow('ERR_NULL');
  });

  test('should throw when validator.throwsIfNotNull for existing instance', () => {
    const result = Result.ok('ok');

    expect(() => result.validator.throwsIfNotNull('ERR_NOT_NULL')).toThrow('ERR_NOT_NULL');
  });

  test('should throw when validator.throwsIfFailed and result is failure', () => {
    const result = Result.fail('ERR_FAILED');

    expect(() => result.validator.throwsIfFailed()).toThrow('ERR_FAILED');
  });

  test('should allow chaining validations and custom exception factory', () => {
    const result = Result.ok(true);

    expect(() =>
      result.validator
        .throwsIfFalse()
        .throwsIfNull()
        .throwsIfTrue('CHAINED', (error) => new TypeError(String(error))),
    ).toThrow(TypeError);
  });

  test('should not throw when validations are satisfied', () => {
    const result = Result.ok(true);

    expect(() => result.validator.throwsIfFalse().throwsIfNull()).not.toThrow();
  });

  test('should return original result at the end of fluent validation', () => {
    const result = Result.ok(true);

    const validatedResult = result.validator.throwsIfFalse().result;

    expect(validatedResult).toBe(result);
    expect(validatedResult.isOk).toBe(true);
    expect(validatedResult.instance).toBe(true);
  });

  test('should convert to string for ok and fail', () => {
    const ok = Result.ok({ a: 1 });
    const fail = Result.fail('ERR');

    expect(ok.toString()).toBe('Result.ok({"a":1})');
    expect(fail.toString()).toBe('Result.fail(["ERR"])');
  });
});

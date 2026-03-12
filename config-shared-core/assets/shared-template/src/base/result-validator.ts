export type ResultValidationError = string | string[] | Error;
export type ResultExceptionFactory = (error: ResultValidationError) => unknown;

type ResultValidationSource<T> = {
  readonly instance: T;
  readonly isFailure: boolean;
  readonly errors?: string[];
};

export class ResultValidator<T, TSource extends ResultValidationSource<T> = ResultValidationSource<T>> {
  constructor(private readonly source: TSource) {}

  throwsIfTrue(
    this: ResultValidator<boolean, any>,
    error: ResultValidationError = 'RESULT_EXPRESSION_TRUE',
    exceptionFactory?: ResultExceptionFactory,
  ) {
    if (this.source.instance === true) {
      this.throwError(error, exceptionFactory);
    }

    return this;
  }

  throwsIfFalse(
    this: ResultValidator<boolean, any>,
    error: ResultValidationError = 'RESULT_EXPRESSION_FALSE',
    exceptionFactory?: ResultExceptionFactory,
  ) {
    if (this.source.instance === false) {
      this.throwError(error, exceptionFactory);
    }

    return this;
  }

  throwsIfNull(error: ResultValidationError = 'RESULT_INSTANCE_NULL', exceptionFactory?: ResultExceptionFactory): this {
    if (this.source.instance == null) {
      this.throwError(error, exceptionFactory);
    }

    return this;
  }

  throwsIfNotNull(
    error: ResultValidationError = 'RESULT_INSTANCE_NOT_NULL',
    exceptionFactory?: ResultExceptionFactory,
  ): this {
    if (this.source.instance != null) {
      this.throwError(error, exceptionFactory);
    }

    return this;
  }

  throwsIfEmpty(
    error: ResultValidationError = 'RESULT_INSTANCE_EMPTY',
    exceptionFactory?: ResultExceptionFactory,
  ): this {
    if (this.source.instance instanceof Array && this.source.instance.length === 0) {
      this.throwError(error, exceptionFactory);
    }

    return this;
  }

  throwsIfNotEmpty(
    error: ResultValidationError = 'RESULT_INSTANCE_NOT_EMPTY',
    exceptionFactory?: ResultExceptionFactory,
  ): this {
    if (this.source.instance instanceof Array && this.source.instance.length > 0) {
      this.throwError(error, exceptionFactory);
    }

    return this;
  }

  throwsIfFailed(
    error: ResultValidationError = this.source.errors ?? 'RESULT_FAILED',
    exceptionFactory?: ResultExceptionFactory,
  ): this {
    if (this.source.isFailure) {
      this.throwError(error, exceptionFactory);
    }

    return this;
  }

  get result(): TSource {
    return this.source;
  }

  private throwError(error: ResultValidationError, exceptionFactory?: ResultExceptionFactory): never {
    if (exceptionFactory) {
      throw exceptionFactory(error);
    }

    if (error instanceof Error) {
      throw error;
    }

    if (Array.isArray(error)) {
      throw new Error(error.join(', '));
    }

    throw new Error(error);
  }
}

export class Result<T> {
    constructor(
        private readonly _instance?: T | null,
        private _errors?: string[],
    ) {}

    static ok<T>(instance?: T): Result<T> {
        return new Result<T>(instance ?? null);
    }

    static fail<T>(e: string | string[]): Result<T> {
        const erro = typeof e === "string" ? [e] : e;
        return new Result<T>(undefined, Array.isArray(erro) ? erro : [erro]);
    }

    static async try<T>(fn: () => Promise<Result<T>>): Promise<Result<T>> {
        try {
            return await fn();
        } catch (e: any) {
            return Result.fail<T>(e);
        }
    }

    static trySync<T>(fn: () => T): Result<T> {
        try {
            return Result.ok<T>(fn());
        } catch (e: any) {
            return Result.fail<T>(e);
        }
    }

    throwIfFailed(): never | void {
        if (this.isFailure) {
            throw this.errors;
        }
    }

    get instance(): T {
        return this._instance!;
    }

    get errors(): string[] | undefined {
        const semErros = !this._errors || this._errors.length === 0;
        if (semErros && this._instance === undefined) {
            return ["RESULT_UNDEFINED"];
        }
        return this._errors;
    }

    get isOk(): boolean {
        return !this.errors;
    }

    get isFailure(): boolean {
        return !!this.errors;
    }

    get withFail(): Result<any> {
        return Result.fail<any>(this.errors!);
    }

    static combine<const R extends readonly Result<any>[]>(
        results: R,
    ): Result<{ [K in keyof R]: R[K] extends Result<infer T> ? T : never }> {
        const errors = results.filter((r) => r.isFailure);
        if (errors.length) {
            return Result.fail(errors.flatMap((r) => r.errors!));
        }

        const instances = results.map((r) => r._instance) as unknown as {
            [K in keyof R]: R[K] extends Result<infer T> ? T : never;
        };

        return Result.ok(instances);
    }

    static async combineAsync<T>(
        results: Promise<Result<T>>[],
    ): Promise<Result<T[]>> {
        const rs = await Promise.all(results);
        return Result.combine(rs);
    }

    toString(): string {
        if (this.isOk) {
            return `Result.ok(${JSON.stringify(this._instance)})`;
        } else {
            return `Result.fail(${JSON.stringify(this._errors)})`;
        }
    }
}

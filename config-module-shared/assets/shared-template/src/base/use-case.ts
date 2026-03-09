import { Result } from "./result";

export interface UseCase<IN, OUT> {
	execute(data: IN): Promise<Result<OUT>>;
}

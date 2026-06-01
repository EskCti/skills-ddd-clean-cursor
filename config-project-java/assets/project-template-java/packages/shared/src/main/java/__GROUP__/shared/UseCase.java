package __GROUP__.shared;

public interface UseCase<I, O> {
    Result<O> execute(I input);
}

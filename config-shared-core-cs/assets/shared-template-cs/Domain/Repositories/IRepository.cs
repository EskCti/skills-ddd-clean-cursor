using Project.Shared.Kernel.Domain.Results;

namespace Project.Shared.Kernel.Domain.Repositories;

public interface IRepository<T> where T : class
{
    Task<Result<T>> GetById(Guid id);
    Task<Result> Save(T entity);
    Task<Result> Delete(Guid id);
}

public interface IReadOnlyRepository<T> where T : class
{
    Task<Result<T>> GetById(Guid id);
    Task<Result<IEnumerable<T>>> GetAll();
}

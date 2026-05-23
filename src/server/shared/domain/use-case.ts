export interface UseCase<TRequest = unknown, TResponse = unknown> {
  execute(request: TRequest): Promise<TResponse>;
}

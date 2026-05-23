export class Result<T, E = string> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _error?: E,
    private readonly _value?: T,
    private readonly _errorMessage?: string
  ) {}

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  getValue(): T {
    if (!this._isSuccess) {
      throw new Error("Cannot get value from failed result");
    }
    return this._value as T;
  }

  error(): E {
    if (this._isSuccess) {
      throw new Error("Cannot get error from successful result");
    }
    return this._error as E;
  }

  errorMessage(): string {
    if (this._isSuccess) {
      throw new Error("Cannot get error message from successful result");
    }
    if (this._error instanceof Error) {
      return this._error.message;
    }
    return this._errorMessage as string;
  }

  static ok<T, E = string>(value: T): Result<T, E> {
    return new Result<T, E>(true, undefined, value);
  }

  static fail<T, E>(error: E, message?: string): Result<T, E> {
    return new Result<T, E>(false, error, undefined, message);
  }
}

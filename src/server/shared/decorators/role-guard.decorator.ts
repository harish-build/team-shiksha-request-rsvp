import { ForbiddenError } from "../domain/errors";
import { Result } from "../domain/result";
import type { UseCase } from "../domain/use-case";
import type { Role } from "../infrastructure/session-data";

export interface HasActorRole {
  actorRole: Role;
}

export class RoleGuardDecorator<TRequest extends HasActorRole, TResponse> implements UseCase {
  constructor(
    private readonly allowedRoles: readonly Role[],
    private readonly inner: UseCase<TRequest, Result<TResponse, Error>>
  ) {}

  async execute(request: TRequest): Promise<Result<TResponse, Error>> {
    if (!this.allowedRoles.includes(request.actorRole)) {
      return Result.fail(
        new ForbiddenError(`Role ${request.actorRole} cannot perform this action`)
      );
    }
    return this.inner.execute(request);
  }
}

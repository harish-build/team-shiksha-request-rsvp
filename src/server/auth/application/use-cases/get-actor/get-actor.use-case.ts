import { Result } from "@/server/shared/domain/result";
import type { UseCase } from "@/server/shared/domain/use-case";
import type { GetActorRequest, GetActorResponse } from "./get-actor.types";

export class GetActorUseCase implements UseCase<GetActorRequest, GetActorResponse> {
  async execute(request: GetActorRequest): Promise<GetActorResponse> {
    return Result.ok(request.actor);
  }
}

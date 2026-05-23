import type { Result } from "@/server/shared/domain/result";
import type { Actor } from "../../../domain/entities/actor";

export interface GetActorRequest {
  actor: Actor;
}

export type GetActorResponse = Result<Actor, Error>;

import type { AuthRepository } from "../../interfaces/auth.repository";
import type { Actor } from "../../types/actor";

export class GetMeUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<Actor | null> {
    return this.authRepository.getMe();
  }
}

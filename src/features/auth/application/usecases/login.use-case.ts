import type { AuthRepository } from "../../interfaces/auth.repository";
import type { Actor } from "../../types/actor";

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<Actor> {
    return this.authRepository.login({ email, password });
  }
}

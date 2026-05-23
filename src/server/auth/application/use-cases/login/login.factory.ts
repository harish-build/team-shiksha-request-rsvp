import { PrismaUserRepository } from "../../../infrastructure/repositories/prisma-user.repository";
import { LoginUseCase } from "./login.use-case";

export class LoginUseCaseFactory {
  create(): LoginUseCase {
    const userRepository = new PrismaUserRepository();
    return new LoginUseCase(userRepository);
  }
}

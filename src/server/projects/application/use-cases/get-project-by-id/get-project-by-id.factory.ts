import { PrismaProjectRepository } from "../../../infrastructure/repositories/prisma-project.repository";
import { GetProjectByIdUseCase } from "./get-project-by-id.use-case";

export class GetProjectByIdUseCaseFactory {
  create(): GetProjectByIdUseCase {
    const projectRepository = new PrismaProjectRepository();
    return new GetProjectByIdUseCase(projectRepository);
  }
}

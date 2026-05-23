import { PrismaProjectRepository } from "../../../infrastructure/repositories/prisma-project.repository";
import { ListProjectsUseCase } from "./list-projects.use-case";

export class ListProjectsUseCaseFactory {
  create(): ListProjectsUseCase {
    const projectRepository = new PrismaProjectRepository();
    return new ListProjectsUseCase(projectRepository);
  }
}

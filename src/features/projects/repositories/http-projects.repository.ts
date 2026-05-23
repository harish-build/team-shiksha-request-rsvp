import type { HttpClient } from "@/shared/interfaces/http-client";
import type { ProjectsRepository } from "../interfaces/projects.repository";
import type { Project } from "../types/project";

interface ListProjectsResponseBody {
  projects: Project[];
}

export class HttpProjectsRepository implements ProjectsRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(): Promise<Project[]> {
    const response = await this.httpClient.get<ListProjectsResponseBody>({ path: "/api/projects" });
    return response.projects;
  }
}

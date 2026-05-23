import type { HttpClient } from "@/shared/interfaces/http-client";
import { HttpError } from "@/shared/services/http-error";
import type { ProjectsRepository } from "../interfaces/projects.repository";
import type { Project } from "../types/project";

interface ListProjectsResponseBody {
  projects: Project[];
}

interface GetProjectResponseBody {
  project: Project;
}

export class HttpProjectsRepository implements ProjectsRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(): Promise<Project[]> {
    const response = await this.httpClient.get<ListProjectsResponseBody>({ path: "/api/projects" });
    return response.projects;
  }

  async getById(id: string): Promise<Project | null> {
    try {
      const response = await this.httpClient.get<GetProjectResponseBody>({
        path: `/api/projects/${encodeURIComponent(id)}`,
      });
      return response.project;
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return null;
      throw error;
    }
  }
}

import type { HttpClient } from "@/shared/interfaces/http-client";
import { HttpError } from "@/shared/services/http-error";
import { ValidationError } from "@/features/auth/errors/validation.error";
import type {
  CreateProjectInput,
  ProjectsRepository,
  UpdateProjectInput,
} from "../interfaces/projects.repository";
import { ForbiddenError } from "../errors/forbidden.error";
import { NotFoundError } from "../errors/not-found.error";
import type { Project } from "../types/project";

interface ListProjectsResponseBody {
  projects: Project[];
}

interface GetProjectResponseBody {
  project: Project;
}

interface CreateProjectResponseBody {
  project: Project;
}

interface UpdateProjectResponseBody {
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

  async create(input: CreateProjectInput): Promise<Project> {
    try {
      const response = await this.httpClient.post<CreateProjectResponseBody>({
        path: "/api/projects",
        body: { name: input.name, orgId: input.orgId },
      });
      return response.project;
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status === 400) throw new ValidationError(error.message);
        if (error.status === 403) throw new ForbiddenError(error.message);
      }
      throw error;
    }
  }

  async update(id: string, patch: UpdateProjectInput): Promise<Project> {
    try {
      const response = await this.httpClient.put<UpdateProjectResponseBody>({
        path: `/api/projects/${encodeURIComponent(id)}`,
        body: { name: patch.name },
      });
      return response.project;
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status === 400) throw new ValidationError(error.message);
        if (error.status === 403) throw new ForbiddenError(error.message);
        if (error.status === 404) throw new NotFoundError(error.message);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.httpClient.delete<void>({
        path: `/api/projects/${encodeURIComponent(id)}`,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status === 403) throw new ForbiddenError(error.message);
        if (error.status === 404) throw new NotFoundError(error.message);
      }
      throw error;
    }
  }
}

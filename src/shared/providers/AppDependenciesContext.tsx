"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { FetchHttpClient } from "@/shared/services/fetch-http.client";
import type { HttpClient } from "@/shared/interfaces/http-client";
import { HttpAuthRepository } from "@/features/auth/repositories/http-auth.repository";
import type { AuthRepository } from "@/features/auth/interfaces/auth.repository";
import { LoginUseCase } from "@/features/auth/application/usecases/login.use-case";
import { GetMeUseCase } from "@/features/auth/application/usecases/get-me.use-case";
import { HttpProjectsRepository } from "@/features/projects/repositories/http-projects.repository";
import type { ProjectsRepository } from "@/features/projects/interfaces/projects.repository";
import { ListProjectsUseCase } from "@/features/projects/application/usecases/list-projects.use-case";
import { GetProjectByIdUseCase } from "@/features/projects/application/usecases/get-project-by-id.use-case";
import { CreateProjectUseCase } from "@/features/projects/application/usecases/create-project.use-case";

export interface AppDependencies {
  httpClient: HttpClient;
  authRepository: AuthRepository;
  projectsRepository: ProjectsRepository;
  loginUseCase: LoginUseCase;
  getMeUseCase: GetMeUseCase;
  listProjectsUseCase: ListProjectsUseCase;
  getProjectByIdUseCase: GetProjectByIdUseCase;
  createProjectUseCase: CreateProjectUseCase;
}

const AppDependenciesContext = createContext<AppDependencies | null>(null);

export function AppDependenciesProvider({ children }: { children: ReactNode }) {
  const dependencies = useMemo<AppDependencies>(() => {
    const httpClient = new FetchHttpClient();
    const authRepository = new HttpAuthRepository(httpClient);
    const projectsRepository = new HttpProjectsRepository(httpClient);
    const loginUseCase = new LoginUseCase(authRepository);
    const getMeUseCase = new GetMeUseCase(authRepository);
    const listProjectsUseCase = new ListProjectsUseCase(projectsRepository);
    const getProjectByIdUseCase = new GetProjectByIdUseCase(projectsRepository);
    const createProjectUseCase = new CreateProjectUseCase(projectsRepository);
    return {
      httpClient,
      authRepository,
      projectsRepository,
      loginUseCase,
      getMeUseCase,
      listProjectsUseCase,
      getProjectByIdUseCase,
      createProjectUseCase,
    };
  }, []);

  return (
    <AppDependenciesContext.Provider value={dependencies}>
      {children}
    </AppDependenciesContext.Provider>
  );
}

export function useAppDependencies(): AppDependencies {
  const value = useContext(AppDependenciesContext);
  if (!value) {
    throw new Error("useAppDependencies must be used within an AppDependenciesProvider");
  }
  return value;
}

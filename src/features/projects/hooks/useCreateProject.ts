"use client";

import { useCallback, useState } from "react";
import { ValidationError } from "@/features/auth/errors/validation.error";
import { ForbiddenError } from "../errors/forbidden.error";
import type { CreateProjectUseCase } from "../application/usecases/create-project.use-case";
import type { CreateProjectInput } from "../interfaces/projects.repository";
import type { Project } from "../types/project";

export interface UseCreateProjectDependencies {
  createProjectUseCase: CreateProjectUseCase;
}

export interface UseCreateProjectReturn {
  isLoading: boolean;
  error: string | null;
  create: (input: CreateProjectInput) => Promise<Project>;
}

export function useCreateProject({
  createProjectUseCase,
}: UseCreateProjectDependencies): UseCreateProjectReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (input: CreateProjectInput): Promise<Project> => {
      setIsLoading(true);
      setError(null);
      try {
        return await createProjectUseCase.execute(input);
      } catch (err) {
        if (err instanceof ValidationError) setError(err.message);
        else if (err instanceof ForbiddenError) setError(err.message);
        else setError("Unable to create project. Please try again.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [createProjectUseCase]
  );

  return { isLoading, error, create };
}

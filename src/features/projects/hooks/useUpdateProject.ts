"use client";

import { useCallback, useState } from "react";
import { ValidationError } from "@/features/auth/errors/validation.error";
import { ForbiddenError } from "../errors/forbidden.error";
import { NotFoundError } from "../errors/not-found.error";
import type { UpdateProjectUseCase } from "../application/usecases/update-project.use-case";
import type { Project } from "../types/project";

export interface UseUpdateProjectDependencies {
  updateProjectUseCase: UpdateProjectUseCase;
}

export interface UseUpdateProjectReturn {
  isLoading: boolean;
  error: string | null;
  update: (id: string, name: string) => Promise<Project>;
}

export function useUpdateProject({
  updateProjectUseCase,
}: UseUpdateProjectDependencies): UseUpdateProjectReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (id: string, name: string): Promise<Project> => {
      setIsLoading(true);
      setError(null);
      try {
        return await updateProjectUseCase.execute(id, { name });
      } catch (err) {
        if (err instanceof ValidationError) setError(err.message);
        else if (err instanceof ForbiddenError) setError(err.message);
        else if (err instanceof NotFoundError) setError("This project no longer exists.");
        else setError("Unable to update project. Please try again.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateProjectUseCase]
  );

  return { isLoading, error, update };
}

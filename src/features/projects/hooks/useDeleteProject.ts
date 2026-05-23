"use client";

import { useCallback, useState } from "react";
import { ForbiddenError } from "../errors/forbidden.error";
import { NotFoundError } from "../errors/not-found.error";
import type { DeleteProjectUseCase } from "../application/usecases/delete-project.use-case";

export interface UseDeleteProjectDependencies {
  deleteProjectUseCase: DeleteProjectUseCase;
}

export interface UseDeleteProjectReturn {
  isLoading: boolean;
  error: string | null;
  delete: (id: string) => Promise<void>;
}

export function useDeleteProject({
  deleteProjectUseCase,
}: UseDeleteProjectDependencies): UseDeleteProjectReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProject = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await deleteProjectUseCase.execute(id);
      } catch (err) {
        if (err instanceof ForbiddenError) setError(err.message);
        else if (err instanceof NotFoundError) setError("This project no longer exists.");
        else setError("Unable to delete project. Please try again.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [deleteProjectUseCase]
  );

  return { isLoading, error, delete: deleteProject };
}

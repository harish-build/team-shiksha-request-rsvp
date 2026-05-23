"use client";

import { useCallback, useEffect, useState } from "react";
import type { ListProjectsUseCase } from "../application/usecases/list-projects.use-case";
import type { Project } from "../types/project";

export interface UseListProjectsDependencies {
  listProjectsUseCase: ListProjectsUseCase;
  enabled?: boolean;
}

export interface UseListProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useListProjects({
  listProjectsUseCase,
  enabled = true,
}: UseListProjectsDependencies): UseListProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listProjectsUseCase.execute();
      setProjects(result);
    } catch {
      setError("Unable to load projects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [listProjectsUseCase]);

  useEffect(() => {
    if (!enabled) return;
    void fetchProjects();
  }, [enabled, fetchProjects]);

  return { projects, isLoading, error, refetch: fetchProjects };
}

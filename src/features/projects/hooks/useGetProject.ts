"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppDependencies } from "@/shared/providers/AppDependenciesContext";
import type { Project } from "../types/project";

export interface UseGetProjectReturn {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGetProject(projectId: string): UseGetProjectReturn {
  const { getProjectByIdUseCase } = useAppDependencies();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setProject(null);
    getProjectByIdUseCase
      .execute(projectId)
      .then((result) => {
        if (cancelled) return;
        setProject(result);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Unable to load project. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, getProjectByIdUseCase, reloadToken]);

  const refetch = useCallback(async () => {
    setReloadToken((token) => token + 1);
  }, []);

  return { project, isLoading, error, refetch };
}

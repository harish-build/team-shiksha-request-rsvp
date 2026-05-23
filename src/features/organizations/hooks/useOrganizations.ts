"use client";

import { useCallback, useEffect, useState } from "react";
import type { ListOrganizationsUseCase } from "../application/usecases/list-organizations.use-case";
import type { Organization } from "../types/organization";

export interface UseOrganizationsDependencies {
  listOrganizationsUseCase: ListOrganizationsUseCase;
  enabled?: boolean;
}

export interface UseOrganizationsReturn {
  organizations: Organization[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOrganizations({
  listOrganizationsUseCase,
  enabled = true,
}: UseOrganizationsDependencies): UseOrganizationsReturn {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listOrganizationsUseCase.execute();
      setOrganizations(result);
    } catch {
      setError("Unable to load organizations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [listOrganizationsUseCase]);

  useEffect(() => {
    if (!enabled) return;
    void fetchOrganizations();
  }, [enabled, fetchOrganizations]);

  return { organizations, isLoading, error, refetch: fetchOrganizations };
}

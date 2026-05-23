"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Role } from "@/features/auth/types/actor";
import type { Organization } from "@/features/organizations/types/organization";
import type { Project } from "../types/project";

export interface CreateProjectFormProps {
  actorRole: Role;
  actorOrgId: string | null;
  isLoading: boolean;
  error: string | null;
  onSubmit: (input: { name: string; orgId: string }) => Promise<Project | void>;
  organizations?: Organization[];
  isLoadingOrgs?: boolean;
}

export function CreateProjectForm({
  actorRole,
  actorOrgId,
  isLoading,
  error,
  onSubmit,
  organizations = [],
  isLoadingOrgs = false,
}: CreateProjectFormProps) {
  const isSuperadmin = actorRole === "SUPERADMIN";
  const [name, setName] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  useEffect(() => {
    if (!isSuperadmin) return;
    if (selectedOrgId) return;
    if (organizations.length === 0) return;
    setSelectedOrgId(organizations[0].id);
  }, [isSuperadmin, organizations, selectedOrgId]);

  const disabled = isLoading || (isSuperadmin && isLoadingOrgs);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const orgId = isSuperadmin ? selectedOrgId : actorOrgId ?? "";
    if (!orgId) return;
    try {
      await onSubmit({ name: name.trim(), orgId });
      setName("");
    } catch {
      // error state is owned by the parent hook; nothing to do here
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Create project"
      className="flex flex-col gap-3 border rounded p-4 w-full"
    >
      <h2 className="text-lg font-medium">New project</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="project-name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={disabled}
          className="border rounded px-3 py-2 disabled:opacity-50"
        />
      </div>

      {isSuperadmin && (
        <div className="flex flex-col gap-1">
          <label htmlFor="project-org-id" className="text-sm font-medium">
            Organization
          </label>
          {isLoadingOrgs ? (
            <p className="text-sm text-gray-600">Loading organizations…</p>
          ) : (
            <select
              id="project-org-id"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              required
              disabled={disabled}
              className="border rounded px-3 py-2 disabled:opacity-50"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50 self-start"
      >
        {isLoading ? "Creating…" : "Create project"}
      </button>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import type { Role } from "@/features/auth/types/actor";
import type { Project } from "../types/project";

export interface CreateProjectFormProps {
  actorRole: Role;
  actorOrgId: string | null;
  isLoading: boolean;
  error: string | null;
  onSubmit: (input: { name: string; orgId: string }) => Promise<Project | void>;
}

export function CreateProjectForm({
  actorRole,
  actorOrgId,
  isLoading,
  error,
  onSubmit,
}: CreateProjectFormProps) {
  const isSuperadmin = actorRole === "SUPERADMIN";
  const [name, setName] = useState("");
  const [orgIdInput, setOrgIdInput] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const orgId = isSuperadmin ? orgIdInput.trim() : actorOrgId ?? "";
    try {
      await onSubmit({ name: name.trim(), orgId });
      setName("");
      if (isSuperadmin) setOrgIdInput("");
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
          disabled={isLoading}
          className="border rounded px-3 py-2 disabled:opacity-50"
        />
      </div>

      {isSuperadmin && (
        <div className="flex flex-col gap-1">
          <label htmlFor="project-org-id" className="text-sm font-medium">
            Organization ID
          </label>
          <input
            id="project-org-id"
            type="text"
            value={orgIdInput}
            onChange={(e) => setOrgIdInput(e.target.value)}
            required
            disabled={isLoading}
            className="border rounded px-3 py-2 disabled:opacity-50"
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50 self-start"
      >
        {isLoading ? "Creating…" : "Create project"}
      </button>
    </form>
  );
}

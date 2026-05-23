"use client";

import { useState, type FormEvent } from "react";
import type { Project } from "../types/project";

export interface EditProjectFormProps {
  project: Project;
  isLoading: boolean;
  error: string | null;
  onSubmit: (name: string) => Promise<Project | void>;
  onCancel?: () => void;
}

export function EditProjectForm({
  project,
  isLoading,
  error,
  onSubmit,
  onCancel,
}: EditProjectFormProps) {
  const [name, setName] = useState(project.name);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await onSubmit(name.trim());
    } catch {
      // Parent hook owns the error state
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Edit project"
      className="flex flex-col gap-3 border rounded p-4 w-full"
    >
      <h2 className="text-lg font-medium">Edit project</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="edit-project-name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="edit-project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          className="border rounded px-3 py-2 disabled:opacity-50"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {isLoading ? "Saving…" : "Save"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="border rounded px-4 py-2 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

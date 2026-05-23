"use client";

import { useState } from "react";

export interface DeleteProjectButtonProps {
  projectId: string;
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => Promise<void>;
}

export function DeleteProjectButton({
  projectId,
  isLoading,
  error,
  onDelete,
}: DeleteProjectButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleInitiate = () => {
    setIsConfirming(true);
  };

  const handleCancel = () => {
    setIsConfirming(false);
  };

  const handleConfirm = async () => {
    try {
      await onDelete(projectId);
    } catch {
      setIsConfirming(false);
    }
  };

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={handleInitiate}
        className="border border-red-600 text-red-600 rounded px-3 py-1.5 text-sm hover:bg-red-50"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isLoading}
          className="bg-red-600 text-white rounded px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {isLoading ? "Deleting…" : "Confirm delete"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="border rounded px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

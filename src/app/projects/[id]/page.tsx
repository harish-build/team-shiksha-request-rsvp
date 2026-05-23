"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAppDependencies } from "@/shared/providers/AppDependenciesContext";
import { useGetProject } from "@/features/projects/hooks/useGetProject";
import type { Actor } from "@/features/auth/types/actor";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = typeof params?.id === "string" ? params.id : "";
  const { getMeUseCase, httpClient } = useAppDependencies();
  const [actor, setActor] = useState<Actor | null>(null);
  const [isResolvingActor, setIsResolvingActor] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    getMeUseCase
      .execute()
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          router.replace("/login");
          return;
        }
        setActor(result);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      })
      .finally(() => {
        if (!cancelled) setIsResolvingActor(false);
      });
    return () => {
      cancelled = true;
    };
  }, [getMeUseCase, router]);

  const { project, isLoading: isLoadingProject, error } = useGetProject(projectId);

  const handleSignOut = async () => {
    try {
      await httpClient.post({ path: "/api/auth/logout" });
    } catch {
      // Ignore logout failures - we still want to send the user to /login
    }
    router.replace("/login");
  };

  if (isResolvingActor || !actor) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-gray-600">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
      <header className="flex items-center justify-between border-b pb-4">
        <div className="flex flex-col">
          <Link href="/projects" className="text-sm text-blue-600 hover:underline">
            ← Back to projects
          </Link>
          <span className="text-sm text-gray-600 mt-1">Signed in as {actor.email}</span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="border rounded px-3 py-1.5 text-sm hover:bg-gray-100"
        >
          Sign out
        </button>
      </header>

      {isLoadingProject && <p className="text-sm text-gray-600">Loading project…</p>}

      {!isLoadingProject && error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {!isLoadingProject && !error && project === null && (
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold">Project not found</h1>
          <p className="text-sm text-gray-600">
            This project does not exist or you don&apos;t have access to it.
          </p>
        </div>
      )}

      {!isLoadingProject && !error && project && (
        <article className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <span className="text-xs text-gray-500">Organization: {project.orgId}</span>
        </article>
      )}
    </main>
  );
}

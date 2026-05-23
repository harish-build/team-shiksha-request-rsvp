"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDependencies } from "@/shared/providers/AppDependenciesContext";
import { useListProjects } from "@/features/projects/hooks/useListProjects";
import { ProjectList } from "@/features/projects/components/ProjectList";
import type { Actor } from "@/features/auth/types/actor";

export default function ProjectsPage() {
  const router = useRouter();
  const { getMeUseCase, listProjectsUseCase, httpClient } = useAppDependencies();
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

  const { projects, isLoading: isLoadingProjects, error } = useListProjects({
    listProjectsUseCase,
    enabled: actor !== null,
  });

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
          <h1 className="text-2xl font-semibold">Projects</h1>
          <span className="text-sm text-gray-600">Signed in as {actor.email}</span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="border rounded px-3 py-1.5 text-sm hover:bg-gray-100"
        >
          Sign out
        </button>
      </header>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {isLoadingProjects ? (
        <p className="text-sm text-gray-600">Loading projects…</p>
      ) : (
        <ProjectList projects={projects} />
      )}
    </main>
  );
}

import type { Project } from "../types/project";

export interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-gray-600" role="status">
        You don&apos;t have access to any projects yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2 w-full max-w-md">
      {projects.map((project) => (
        <li
          key={project.id}
          className="border rounded px-4 py-3 flex flex-col gap-1"
        >
          <span className="font-medium">{project.name}</span>
        </li>
      ))}
    </ul>
  );
}

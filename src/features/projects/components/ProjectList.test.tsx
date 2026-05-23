import { render, screen } from "@testing-library/react";
import { ProjectList } from "./ProjectList";
import type { Project } from "../types/project";

class ProjectListPage {
  shouldShowProjectNamed(name: string | RegExp): void {
    expect(screen.getByText(name)).toBeInTheDocument();
  }
  shouldShowEmptyState(): void {
    expect(screen.getByRole("status")).toHaveTextContent(/don.?t have access to any projects/i);
  }
  rowCount(): number {
    return screen.queryAllByRole("listitem").length;
  }
}

describe("Component Test: ProjectList", () => {
  const renderComponent = (projects: Project[]) => {
    render(<ProjectList projects={projects} />);
    return { page: new ProjectListPage() };
  };

  it("renders one row per project, showing the project name", () => {
    const projects: Project[] = [
      { id: "p1", name: "Alpha", orgId: "org-a" },
      { id: "p2", name: "Beta", orgId: "org-a" },
      { id: "p3", name: "Gamma", orgId: "org-b" },
    ];

    const { page } = renderComponent(projects);

    expect(page.rowCount()).toBe(3);
    page.shouldShowProjectNamed("Alpha");
    page.shouldShowProjectNamed("Beta");
    page.shouldShowProjectNamed("Gamma");
  });

  it("shows an empty state when there are no projects", () => {
    const { page } = renderComponent([]);

    page.shouldShowEmptyState();
    expect(page.rowCount()).toBe(0);
  });
});

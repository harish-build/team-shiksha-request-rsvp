import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditProjectForm } from "./EditProjectForm";
import type { Project } from "../types/project";

class EditProjectFormPage {
  get nameField() {
    return screen.getByLabelText(/name/i);
  }
  get saveButton() {
    return screen.getByRole("button", { name: /save|saving/i });
  }
  isSaveDisabled(): boolean {
    return this.saveButton.hasAttribute("disabled");
  }
  shouldShowError(message: string | RegExp) {
    expect(screen.getByRole("alert")).toHaveTextContent(message);
  }
}

describe("Component Test: EditProjectForm", () => {
  const project: Project = { id: "p-1", name: "Original", orgId: "org-a" };

  const renderComponent = (props: {
    isLoading?: boolean;
    error?: string | null;
    onSubmit?: jest.Mock;
  } = {}) => {
    const onSubmit = props.onSubmit ?? jest.fn().mockResolvedValue(undefined);
    render(
      <EditProjectForm
        project={project}
        isLoading={props.isLoading ?? false}
        error={props.error ?? null}
        onSubmit={onSubmit}
      />
    );
    return { page: new EditProjectFormPage(), onSubmit, user: userEvent.setup() };
  };

  it("submits the entered name when save is clicked", async () => {
    const { page, onSubmit, user } = renderComponent();

    await user.clear(page.nameField);
    await user.type(page.nameField, "Renamed");
    await user.click(page.saveButton);

    expect(onSubmit).toHaveBeenCalledWith("Renamed");
  });

  it("disables save while loading", () => {
    const { page } = renderComponent({ isLoading: true });

    expect(page.isSaveDisabled()).toBe(true);
  });

  it("displays the error message when save fails", () => {
    const { page } = renderComponent({ error: "Name is required" });

    page.shouldShowError(/name is required/i);
  });
});

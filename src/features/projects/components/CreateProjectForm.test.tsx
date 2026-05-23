import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateProjectForm } from "./CreateProjectForm";
import type { Role } from "@/features/auth/types/actor";

class CreateProjectFormPage {
  get nameField() {
    return screen.getByLabelText(/name/i);
  }
  queryOrgIdField() {
    return screen.queryByLabelText(/organization id/i);
  }
  get submitButton() {
    return screen.getByRole("button", { name: /create project|creating/i });
  }
  isSubmitDisabled(): boolean {
    return this.submitButton.hasAttribute("disabled");
  }
}

describe("Component Test: CreateProjectForm", () => {
  const renderComponent = (props: {
    actorRole: Role;
    actorOrgId: string | null;
    isLoading?: boolean;
    error?: string | null;
    onSubmit?: jest.Mock;
  }) => {
    const onSubmit = props.onSubmit ?? jest.fn().mockResolvedValue(undefined);
    render(
      <CreateProjectForm
        actorRole={props.actorRole}
        actorOrgId={props.actorOrgId}
        isLoading={props.isLoading ?? false}
        error={props.error ?? null}
        onSubmit={onSubmit}
      />
    );
    return { page: new CreateProjectFormPage(), onSubmit, user: userEvent.setup() };
  };

  it("submits with name and the admin's orgId when admin role", async () => {
    const { page, onSubmit, user } = renderComponent({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
    });

    expect(page.queryOrgIdField()).toBeNull();

    await user.type(page.nameField, "New Initiative");
    await user.click(page.submitButton);

    expect(onSubmit).toHaveBeenCalledWith({ name: "New Initiative", orgId: "org-a" });
  });

  it("submits with the entered orgId when superadmin role", async () => {
    const { page, onSubmit, user } = renderComponent({
      actorRole: "SUPERADMIN",
      actorOrgId: null,
    });

    const orgField = page.queryOrgIdField();
    expect(orgField).not.toBeNull();

    await user.type(page.nameField, "Cross-Org Project");
    await user.type(orgField!, "org-b");
    await user.click(page.submitButton);

    expect(onSubmit).toHaveBeenCalledWith({ name: "Cross-Org Project", orgId: "org-b" });
  });

  it("disables submit while loading", () => {
    const { page } = renderComponent({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      isLoading: true,
    });

    expect(page.isSubmitDisabled()).toBe(true);
  });
});

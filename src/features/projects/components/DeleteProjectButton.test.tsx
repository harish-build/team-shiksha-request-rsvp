import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteProjectButton } from "./DeleteProjectButton";

class DeleteProjectButtonPage {
  get deleteButton() {
    return screen.getByRole("button", { name: /^delete$/i });
  }
  queryConfirmButton() {
    return screen.queryByRole("button", { name: /confirm delete|deleting/i });
  }
  get confirmButton() {
    return screen.getByRole("button", { name: /confirm delete|deleting/i });
  }
  isConfirmDisabled(): boolean {
    return this.confirmButton.hasAttribute("disabled");
  }
}

describe("Component Test: DeleteProjectButton", () => {
  const renderComponent = (props: {
    isLoading?: boolean;
    error?: string | null;
    onDelete?: jest.Mock;
  } = {}) => {
    const onDelete = props.onDelete ?? jest.fn().mockResolvedValue(undefined);
    render(
      <DeleteProjectButton
        projectId="p-1"
        isLoading={props.isLoading ?? false}
        error={props.error ?? null}
        onDelete={onDelete}
      />
    );
    return { page: new DeleteProjectButtonPage(), onDelete, user: userEvent.setup() };
  };

  it("shows a confirm step after first click", async () => {
    const { page, onDelete, user } = renderComponent();

    expect(page.queryConfirmButton()).toBeNull();

    await user.click(page.deleteButton);

    expect(page.queryConfirmButton()).not.toBeNull();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("fires onDelete when confirm is clicked", async () => {
    const { page, onDelete, user } = renderComponent();

    await user.click(page.deleteButton);
    await user.click(page.confirmButton);

    expect(onDelete).toHaveBeenCalledWith("p-1");
  });

  it("disables confirm while loading", async () => {
    const onDelete = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    const { rerender } = render(
      <DeleteProjectButton
        projectId="p-1"
        isLoading={false}
        error={null}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    rerender(
      <DeleteProjectButton
        projectId="p-1"
        isLoading={true}
        error={null}
        onDelete={onDelete}
      />
    );

    const confirm = screen.getByRole("button", { name: /confirm delete|deleting/i });
    expect(confirm.hasAttribute("disabled")).toBe(true);
  });
});

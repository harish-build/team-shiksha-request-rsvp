import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm, type LoginFormProps } from "./LoginForm";

class LoginFormPage {
  get emailField() {
    return screen.getByLabelText(/email/i);
  }
  get passwordField() {
    return screen.getByLabelText(/password/i);
  }
  get submitButton() {
    return screen.getByRole("button", { name: /sign(ing)? in/i });
  }
  shouldShowError(message: string | RegExp): void {
    expect(screen.getByRole("alert")).toHaveTextContent(message);
  }
  isSubmitDisabled(): boolean {
    return this.submitButton.hasAttribute("disabled");
  }
}

describe("Component Test: LoginForm", () => {
  const renderComponent = (overrides: Partial<LoginFormProps> = {}) => {
    const props: LoginFormProps = {
      onSubmit: jest.fn(),
      isLoading: false,
      error: null,
      ...overrides,
    };
    render(<LoginForm {...props} />);
    return { page: new LoginFormPage(), props, user: userEvent.setup() };
  };

  it("submits the entered email and password", async () => {
    const onSubmit = jest.fn();
    const { page, user } = renderComponent({ onSubmit });

    await user.type(page.emailField, "super@demo.test");
    await user.type(page.passwordField, "demo1234");
    await user.click(page.submitButton);

    expect(onSubmit).toHaveBeenCalledWith("super@demo.test", "demo1234");
  });

  it("disables the submit button while a request is in flight", () => {
    const { page } = renderComponent({ isLoading: true });

    expect(page.isSubmitDisabled()).toBe(true);
  });

  it("displays the error message when login fails", () => {
    const { page } = renderComponent({ error: "Invalid email or password" });

    page.shouldShowError(/invalid email or password/i);
  });
});

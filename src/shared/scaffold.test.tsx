import { render, screen } from "@testing-library/react";

describe("scaffold sanity (client)", () => {
  it("renders a DOM element via jsdom", () => {
    render(<h1>scaffold ok</h1>);
    expect(screen.getByRole("heading", { name: /scaffold ok/i })).toBeInTheDocument();
  });
});

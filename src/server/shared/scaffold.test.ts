describe("scaffold sanity (server)", () => {
  it("runs Jest in the node environment", () => {
    expect(typeof window).toBe("undefined");
  });
});

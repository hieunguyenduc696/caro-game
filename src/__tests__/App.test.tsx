import { screen } from "@testing-library/react";
import App from "../App";
import { renderWithProviders } from "../test-utils";

describe("App", () => {
  it("App renders successfully", () => {
    renderWithProviders(<App />);

    const resetBtn = screen.getByText(/reset/i);
    const undoBtn = screen.getByText(/undo/i);
    const redoBtn = screen.getByText(/redo/i);

    expect(resetBtn).toBeInTheDocument();
    expect(undoBtn).toBeInTheDocument();
    expect(redoBtn).toBeInTheDocument();
  });
});

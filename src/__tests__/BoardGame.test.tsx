import BoardGame, {
  checkWin,
  drawBoard,
  highlightWinningCells,
} from "../components/BoardGame";
import { CellValue } from "../constant/enum";
import { RefObject } from "react";
import { tileSize } from "../constant";
import { renderWithProviders } from "../test-utils";
import { screen } from "@testing-library/react";

// Mock the canvas-related properties and methods
class CanvasRenderingContext2DMock {
  clearRect = jest.fn();
  strokeRect = jest.fn();
  fillRect = jest.fn();
}

// Mock the canvas-related properties and methods
class CanvasMock {
  getContext = jest.fn().mockReturnValue(new CanvasRenderingContext2DMock());
}

describe("Board Game", () => {
  it("BoardGame renders successfully", () => {
    renderWithProviders(<BoardGame />);

    const resetBtn = screen.getByText(/reset/i);
    const undoBtn = screen.getByText(/undo/i);
    const redoBtn = screen.getByText(/redo/i);

    expect(resetBtn).toBeInTheDocument();
    expect(undoBtn).toBeInTheDocument();
    expect(redoBtn).toBeInTheDocument();
  });

  it("Shoud draw the board correctly", () => {
    // Create a canvas mock
    const canvasRef: RefObject<HTMLCanvasElement> = {
      current: new CanvasMock() as unknown as HTMLCanvasElement,
    };

    // Set up the test data
    const blocksRef: React.MutableRefObject<[number, number, CellValue][]> = {
      current: [
        [0, 0, CellValue.O],
        [1, 1, CellValue.X],
      ],
    };
    const offsetRef: React.MutableRefObject<{
      x: number;
      y: number;
    }> = {
      current: {
        x: 0,
        y: 0,
      },
    };

    // Create a mock implementation for getContext
    const getContextMock = jest.spyOn(canvasRef.current!, "getContext");
    getContextMock.mockReturnValue({
      font: "",
      textAlign: "" as CanvasTextAlign,
      textBaseline: "" as CanvasTextBaseline,
      fillStyle: "",
      fillText: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      stroke: jest.fn(),
    } as unknown as RenderingContext);

    drawBoard(canvasRef, blocksRef, offsetRef, []);

    // Verify that fillText was called with the correct parameters
    const { fillText } = getContextMock.mock.results[0].value;
    expect(fillText).toHaveBeenCalledTimes(2);
    expect(fillText).toHaveBeenCalledWith(
      "O",
      0 * tileSize + tileSize / 2,
      0 * tileSize + tileSize / 2
    );
    expect(fillText).toHaveBeenCalledWith(
      "X",
      1 * tileSize + tileSize / 2,
      1 * tileSize + tileSize / 2
    );

    // Restore the original implementation of getContext
    getContextMock.mockRestore();
  });

  it("should highlight the winning cells correctly", () => {
    // Create a canvas mock
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const canvasRef: RefObject<HTMLCanvasElement> = {
      current: new CanvasMock() as unknown as HTMLCanvasElement,
    };

    // Set up the test data
    const winningCells = [
      [0, 0],
      [0, 1],
      [0, 2],
    ];

    // Call the function
    highlightWinningCells(canvasRef, winningCells);

    // Verify that fillRect was called with the correct parameters
    const contextMock = canvasRef.current!.getContext(
      "2d"
    ) as unknown as CanvasRenderingContext2DMock;
    expect(contextMock.fillRect).toHaveBeenCalledTimes(winningCells.length);

    // Restore the original implementation of getContext
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it("should return the winning cells when there is a win", () => {
    // Set up the test data
    const row = 0;
    const col = 4;
    const currentPlayer = CellValue.X;
    const blocksRef: React.MutableRefObject<[number, number, CellValue][]> = {
      current: [
        [0, 0, CellValue.X],
        [0, 1, CellValue.X],
        [0, 2, CellValue.X],
        [0, 3, CellValue.X],
        [0, 4, CellValue.X],
      ],
    };

    // Call the function
    const result = checkWin(row, col, blocksRef, currentPlayer);

    // Verify the result
    expect(result).toEqual(
      expect.arrayContaining([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ])
    );
  });

  it("should return null when there is no win", () => {
    // Set up the test data
    const row = 1;
    const col = 2;
    const currentPlayer = CellValue.O;
    const blocksRef: React.MutableRefObject<[number, number, CellValue][]> = {
      current: [
        [0, 0, CellValue.X],
        [0, 1, CellValue.X],
        [0, 2, CellValue.X],
        [0, 3, CellValue.X],
        [0, 4, CellValue.X],
      ],
    };

    // Call the function
    const result = checkWin(row, col, blocksRef, currentPlayer);

    // Verify the result
    expect(result).toBeNull();
  });
});

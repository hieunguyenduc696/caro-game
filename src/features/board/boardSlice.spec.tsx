import { act } from "@testing-library/react";
import { store } from "../../app/store";
import { renderWithProviders } from "../../test-utils";
import {
  incrementStep,
  decrementStep,
  resetBoard,
  removeStorage,
  changeTurn,
  writeToStorage,
} from "./boardSlice";
import BoardGame from "../../components/BoardGame";
import userEvent from "@testing-library/user-event";
import { CellValue } from "../../constant/enum";

describe("Board slice", () => {
  it("Should increment step succeed", async () => {
    userEvent.setup();
    store.dispatch(incrementStep());

    renderWithProviders(<BoardGame />);

    expect(store.getState().board.steps).toEqual(1);
    store.dispatch(resetBoard());
  });

  it("Should decrement step succeed", () => {
    userEvent.setup();

    store.dispatch(incrementStep());
    store.dispatch(incrementStep());

    renderWithProviders(<BoardGame />);

    expect(store.getState().board.steps).toEqual(2);

    act(() => {
      store.dispatch(decrementStep());
    });
    expect(store.getState().board.steps).toEqual(1);

    store.dispatch(resetBoard());
  });

  it("Should reset board succeed", () => {
    userEvent.setup();
    store.dispatch(resetBoard());

    renderWithProviders(<BoardGame />);

    expect(store.getState().board.steps).toEqual(0);
  });

  it("Should write board to storage succeed", () => {
    store.dispatch(writeToStorage([[1, 1, CellValue.X]]));

    expect(localStorage.getItem("blocks")).not.toBeNull();
  });

  it("Should remove board storage succeed", () => {
    store.dispatch(removeStorage());

    expect(localStorage.getItem("XTurn")).toBeNull();
    expect(localStorage.getItem("steps")).toBeNull();
    expect(localStorage.getItem("blocks")).toBeNull();
  });

  it("Should change turn succeed", () => {
    store.dispatch(changeTurn());

    expect(store.getState().board.xTurn).toBeFalsy();
  });
});

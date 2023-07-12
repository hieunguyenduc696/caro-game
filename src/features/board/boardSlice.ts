import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { getPrimitiveStorage } from "../../helpers";
import { CellValue } from "../../constant/enum";

export interface BoardState {
  xTurn: boolean;
  steps: number;
}

const initialState: BoardState = {
  xTurn: getPrimitiveStorage("XTurn", true),
  steps: getPrimitiveStorage("steps", 0),
};

export const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    resetBoard: (state) => {
      state.steps = 0;
      state.xTurn = true;
    },
    decrementStep: (state) => {
      state.steps--;
    },
    incrementStep: (state) => {
      state.steps++;
    },
    writeToStorage: (
      state,
      payload: PayloadAction<[number, number, CellValue][]>
    ) => {
      localStorage.setItem("XTurn", JSON.stringify(state.xTurn));
      localStorage.setItem("blocks", JSON.stringify(payload.payload));
      localStorage.setItem("steps", JSON.stringify(state.steps));
    },
    removeStorage: () => {
      localStorage.removeItem("XTurn");
      localStorage.removeItem("steps");
      localStorage.removeItem("blocks");
    },
    changeTurn: (state) => {
      state.xTurn = !state.xTurn;
    },
  },
});

export const {
  resetBoard,
  decrementStep,
  incrementStep,
  writeToStorage,
  changeTurn,
  removeStorage,
} = boardSlice.actions;

export const selectBoard = (state: RootState) => state.board;

export default boardSlice.reducer;

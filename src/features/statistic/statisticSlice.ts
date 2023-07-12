import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { getPrimitiveStorage } from "../../helpers";

export interface StatisticState {
  numberOfGames: number;
  xWin: number;
  totalStep: number;
}

const initialState: StatisticState = {
  numberOfGames: getPrimitiveStorage("numberOfGames", 0),
  xWin: getPrimitiveStorage("xWin", 0),
  totalStep: getPrimitiveStorage("totalStep", 0),
};

export const statisticSlice = createSlice({
  name: "statistic",
  initialState,
  reducers: {
    updateIfWin: (state, action) => {
      state.numberOfGames++;
      state.totalStep += action.payload.totalStep;
      state.xWin += Number(action.payload.xWin);

      localStorage.setItem(
        "numberOfGames",
        JSON.stringify(state.numberOfGames)
      );
      localStorage.setItem("xWin", JSON.stringify(state.xWin));
      localStorage.setItem("totalStep", JSON.stringify(state.totalStep));
    },
  },
});

export const { updateIfWin } = statisticSlice.actions;

export const selectStatistic = (state: RootState) => state.statistic;

export default statisticSlice.reducer;

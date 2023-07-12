import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import boardReducer from "../features/board/boardSlice";
import statisticReducer from "../features/statistic/statisticSlice";

export const store = configureStore({
  reducer: {
    board: boardReducer,
    statistic: statisticReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

import { store } from "../../app/store";
import { renderWithProviders } from "../../test-utils";
import { updateIfWin } from "./statisticSlice";
import BoardGame from "../../components/BoardGame";

describe("Statistic Slice", () => {
  it("Set update if someone win succeed", async () => {
    store.dispatch(updateIfWin({ xWin: true, totalStep: 1 }));

    renderWithProviders(<BoardGame />);

    expect(store.getState().statistic.totalStep).toEqual(1);
    expect(store.getState().statistic.xWin).toEqual(1);
  });
});

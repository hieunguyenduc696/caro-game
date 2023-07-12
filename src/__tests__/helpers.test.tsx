import { formatNumber, getPrimitiveStorage } from "../helpers";

describe("Helpers", () => {
  it("Should return parse value or default value", () => {
    localStorage.setItem("XTurn", JSON.stringify(true));
    const XTurn = getPrimitiveStorage("XTurn", false);
    const defaultValue = getPrimitiveStorage("nonExist", false);

    expect(XTurn).toEqual(true);
    expect(defaultValue).toEqual(false);
  });

  it("Should return value with two decimal points", () => {
    const x = 10 / 30;
    const format = formatNumber(x);

    expect(format).toEqual(0.33);
  });
});

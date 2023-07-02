import { of } from "rxjs";

describe('"of"', () => {
  it("calls the function each time when multiple arguments", () => {
    const fn = jest.fn();

    of(1, 2, 3).subscribe(fn);

    expect(fn).toHaveBeenCalledWith(1);
    expect(fn).toHaveBeenCalledWith(2);
    expect(fn).toHaveBeenCalledWith(3);

    expect(fn).not.toHaveBeenCalledWith(4);
  });
});

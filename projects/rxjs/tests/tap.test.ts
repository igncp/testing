import { of, tap } from "rxjs";

describe("tap", () => {
  it("calls the function without altering the return value", (done) => {
    const fn = jest.fn();

    of(1, 2, 3)
      .pipe(
        tap((arg) => {
          fn(arg);

          return 4; // This is not used
        })
      )
      .subscribe({
        next: fn,
        complete: () => {
          expect(fn.mock.calls).toEqual([[1], [1], [2], [2], [3], [3]]);
          done();
        },
      });
  });
});

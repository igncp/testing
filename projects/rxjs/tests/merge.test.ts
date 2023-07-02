import { merge, of, delay } from "rxjs";

describe("merge", () => {
  it("calls all the inner observables", (done) => {
    const next = jest.fn();

    merge(of(1), of(2).pipe(delay(10)), of(3)).subscribe({
      next,
      complete: () => {
        expect(next.mock.calls).toEqual([[1], [3], [2]]);

        done();
      },
    });
  });
});

import { concatAll, map, of } from "rxjs";

describe("concatAll", () => {
  it("flattens and observable of observables and waits for each in series", (done) => {
    const sentinel = jest.fn();
    const source$ = of(1, 2, 3).pipe(
      map((x) => of(x * 10, x * 10 + 1, x * 10 + 2))
    );

    source$.pipe(concatAll()).subscribe({
      next: sentinel,
      complete: () => {
        try {
          expect(sentinel.mock.calls).toEqual([
            [10],
            [11],
            [12],
            [20],
            [21],
            [22],
            [30],
            [31],
            [32],
          ]);

          done();
        } catch (error) {
          done(error);
        }
      },
    });
  });
});

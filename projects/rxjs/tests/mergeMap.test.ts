import { of } from "rxjs";
import { mergeMap } from "rxjs/operators";

describe("mergeMap", () => {
  it("passes values (instead of observables) to the subscribed function", (done) => {
    const sentinel = jest.fn();

    of(1, 2, 3)
      .pipe(mergeMap((val) => of(val + 1)))
      .subscribe({
        next: sentinel,
        complete: () => {
          expect(sentinel.mock.calls).toEqual([[2], [3], [4]]);
          done();
        },
      });
  });
});

import { connect, map, merge, range, tap } from "rxjs";

describe("connect", () => {
  it("works as expected", (done) => {
    const fn = jest.fn();
    const sourceSentinel = jest.fn();

    const source$ = range(1, 10);
    const changed$ = source$.pipe(
      map((x) => x + 1),
      tap({ subscribe: sourceSentinel })
    );

    const connected$ = changed$.pipe(
      connect((shared$) =>
        merge(
          shared$.pipe(map((x) => "pipe1_" + x)),
          shared$.pipe(map((x) => "pipe2_" + x))
        )
      )
    );

    connected$.subscribe({
      next: fn,
      complete: () => {
        try {
          // Because the `of` is synchronous, the `complete` callback is called
          // immediately and before returning the subscription
          expect(fn.mock.calls).toEqual(
            Array.from({ length: 10 }).reduce<[string][]>((acc, _, idx) => {
              return acc.concat(
                Array.from({ length: 2 }).map((_, idx2) => {
                  return [`pipe${idx2 + 1}_${idx + 2}`];
                })
              );
            }, [])
          );

          expect(sourceSentinel.mock.calls.length).toBe(1);
          done();
        } catch (err) {
          done(err);
        }
      },
    });
  });
});

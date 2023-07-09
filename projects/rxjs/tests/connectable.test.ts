import { connectable, map, of } from "rxjs";

describe("connectable", () => {
  // This is an example of a multicase observable
  it("waits until calling connect for running subscriptions", (done) => {
    const sentinel = jest.fn();
    const timeoutSentinel = jest.fn();
    let completedSubscribers = 0;

    const source$ = of(1, 2, 3);

    const sourceConnectable$ = connectable(source$);
    const complete = () => {
      try {
        expect(timeoutSentinel.mock.calls).toEqual([[]]);

        completedSubscribers += 1;
        // Wait until both subscribers are completed
        if (completedSubscribers !== 2) return;

        // Both subscribers are called in the same order in parallel
        expect(sentinel.mock.calls).toEqual([
          ["1_1"],
          ["2_1"],
          ["1_2"],
          ["2_2"],
          ["1_3"],
          ["2_3"],
        ]);
        done();
      } catch (error) {
        done(error);
      }
    };

    sourceConnectable$.pipe(map((x) => "1_" + x)).subscribe({
      next: sentinel,
      complete,
    });
    sourceConnectable$.pipe(map((x) => "2_" + x)).subscribe({
      next: sentinel,
      complete,
    });

    // Until the `.connect()` method is called, the subscriptions are not
    // activated
    setTimeout(() => {
      timeoutSentinel();
      sourceConnectable$.connect();
    }, 50);
  });
});

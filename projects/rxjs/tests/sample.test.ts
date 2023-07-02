import { sample, Subject } from "rxjs";

describe('"sample"', () => {
  it("calls the function each time when multiple arguments", async () => {
    const sentinel = jest.fn();
    const source$ = new Subject<number>();
    const sampling$ = new Subject<void>();

    const result$ = source$.pipe(sample(sampling$));

    const subscription = result$.subscribe({
      next: sentinel,
    });

    source$.next(1);
    source$.next(2);

    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(sentinel.mock.calls).toEqual([]);

    sampling$.next();

    await new Promise((resolve) => setTimeout(resolve, 5));

    // Only the latest value of the source is emitted
    expect(sentinel.mock.calls).toEqual([[2]]);

    subscription.unsubscribe();
  });
});

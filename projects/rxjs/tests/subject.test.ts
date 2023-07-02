import { BehaviorSubject, ReplaySubject } from "rxjs";

describe("BehaviorSubject", () => {
  it("gets the last value on subscription", () => {
    const subject = new BehaviorSubject(1);

    subject
      .subscribe((value) => {
        expect(value).toBe(1);
      })
      .unsubscribe();

    subject.next(2);

    subject
      .subscribe((value) => {
        expect(value).toBe(2);
      })
      .unsubscribe();

    expect.assertions(2);
  });
});

describe("ReplaySubject", () => {
  it.each([[1], [5]])("replays the n last values: %s", (n) => {
    const sentinel = jest.fn();
    const subject = new ReplaySubject(n);

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    subject.subscribe(sentinel);

    expect(sentinel.mock.calls).toEqual(
      Array.from({ length: 4 })
        .map((_, i) => [i + 1])
        .slice(Math.max(4 - n, 0), 4)
    );
  });
});

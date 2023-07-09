import { distinctUntilChanged, of } from "rxjs";

describe("distinctUntilChanges", () => {
  it("emits whenever the value changed for primitive types", (done) => {
    const fn = jest.fn();

    of(1, 2, 2, 3, 3)
      .pipe(distinctUntilChanged())
      .subscribe({
        next: fn,
        complete: () => {
          expect(fn.mock.calls).toEqual([[1], [2], [3]]);
          done();
        },
      });
  });

  it("emits whenever the value changed for objects (compared by reference)", (done) => {
    const fn = jest.fn();
    const someObj = { a: 1 };

    of([2], [2], someObj, someObj)
      .pipe(distinctUntilChanged())
      .subscribe({
        next: fn,
        complete: () => {
          // Even if the content is the same, when they are different objects
          // they are considered different in the comparison
          expect(fn.mock.calls).toEqual([[[2]], [[2]], [someObj]]);
          done();
        },
      });
  });
});

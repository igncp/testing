import { timer } from "rxjs";
import { map, raceWith } from "rxjs/operators";

describe("race", () => {
  it("only subscribes to the fast observable", (done) => {
    const fn = jest.fn();
    jest.useFakeTimers();

    const obs1 = timer(70).pipe(map(() => "slow"));
    const obs2 = timer(30).pipe(map(() => "fast"));
    const obs3 = timer(50).pipe(map(() => "medium"));

    obs1.pipe(raceWith(obs1, obs2, obs3)).subscribe({
      next: fn,
      complete: () => {
        try {
          expect(fn.mock.calls).toEqual([["fast"]]);
        } catch (error) {
          done(error);
        }
      },
    });

    setTimeout(() => {
      try {
        expect(fn.mock.calls.length).toBe(1);
        done();
      } catch (error) {
        done(error);
      }
    }, 100);

    jest.runAllTimers();
  });
});

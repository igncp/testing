import { SchedulerLike, scheduled } from "rxjs";

// https://rxjs.dev/guide/scheduler

// The base implementation: https://github.com/ReactiveX/rxjs/blob/master/src/internal/Scheduler.ts
describe("SchedulerLike", () => {
  it("can be implemented and used", () => {
    const scheduler: SchedulerLike = {
      schedule: jest.fn(),
      now: jest.fn(),
    };
    const subscriptionMock = jest.fn();
    const subscribedFn = jest.fn();

    (scheduler.now as jest.Mock).mockReturnValue(1);
    (scheduler.schedule as jest.Mock).mockReturnValue(subscriptionMock);

    const subscription = scheduled([1], scheduler).subscribe(subscribedFn);

    expect(subscriptionMock).not.toHaveBeenCalled();
    subscription.unsubscribe();
    expect(subscriptionMock).toHaveBeenCalled();

    expect((scheduler.now as jest.Mock).mock.calls).toEqual([]);
    expect((scheduler.schedule as jest.Mock).mock.calls).toEqual([
      [expect.any(Function)],
    ]);
  });
});

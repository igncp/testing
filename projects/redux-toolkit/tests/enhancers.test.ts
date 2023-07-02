import {
  autoBatchEnhancer,
  configureStore,
  createSlice,
  prepareAutoBatched,
} from "@reduxjs/toolkit";

// https://redux-toolkit.js.org/api/autoBatchEnhancer
describe("autoBatchEnhancer", () => {
  it.each([[true], [false]] as [boolean][])(
    "delays notifying an action when enabled: %s",
    // @ts-expect-error The `done` is not well supported in types, but it is
    // used and without it the test would not finish
    (enabled: boolean, done: any) => {
      jest.useFakeTimers();

      interface CounterState {
        value: number;
      }

      const sentinel = jest.fn();
      const counterSlice = createSlice({
        name: "counter",
        initialState: { value: 0 } as CounterState,
        reducers: {
          add: {
            reducer(state) {
              state.value += 1;
            },
            prepare: prepareAutoBatched<void>(),
          },
          remove(state) {
            state.value -= 1;
          },
        },
      });
      const { add, remove } = counterSlice.actions;

      const store = configureStore({
        reducer: counterSlice.reducer,
        ...(enabled && {
          enhancers: (existingEnhancers) =>
            existingEnhancers.concat(
              autoBatchEnhancer({ type: "timer", timeout: 50 })
            ),
        }),
      });

      // The reducer is called right away, but delays notifying the subscribers
      store.subscribe(() => {
        sentinel(store.getState().value);
      });

      // If the delayed action happens first, the subscriber function would
      // only be called once, so putting it after
      store.dispatch(remove());
      store.dispatch(add());

      const finalState = [[-1], [0]];

      expect(sentinel.mock.calls).toEqual(enabled ? [[-1]] : finalState);

      setTimeout(() => {
        expect(sentinel.mock.calls).toEqual(finalState);
        done();
      }, 100);

      jest.advanceTimersByTime(100);
    }
  );
});

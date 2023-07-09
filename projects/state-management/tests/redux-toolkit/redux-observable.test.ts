import {
  AnyAction,
  PayloadAction,
  combineReducers,
  configureStore,
  createSlice,
} from "@reduxjs/toolkit";
import { createEpicMiddleware, Epic } from "redux-observable";
import { from, of } from "rxjs";
import { filter, map, delay, mergeMap } from "rxjs/operators";

describe("redux-observable", () => {
  // https://github.com/redux-observable/redux-observable/issues/706
  it.each([true, false])(
    "can be integrated with the toolkit, when enabled: %s",
    (isEnabled) => {
      jest.useFakeTimers();

      const counter = createSlice({
        name: "counter",
        initialState: 0,
        reducers: {
          increment: (state, action: PayloadAction<number>) =>
            state + action.payload,
          decrement: (state, action: PayloadAction<number>) =>
            state - action.payload,
        },
      });

      const reducer = combineReducers({
        counter: counter.reducer,
      });

      type MyState = ReturnType<typeof reducer>;
      type MyEpic = Epic<AnyAction, AnyAction, MyState>;

      const countEpic: MyEpic = (action$) =>
        action$.pipe(
          filter(counter.actions.increment.match),
          delay(500),
          map((action) => counter.actions.decrement(action.payload * 2))
        );

      const epicMiddleware = createEpicMiddleware<
        AnyAction,
        AnyAction,
        MyState
      >();

      const store = configureStore({
        reducer,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat([epicMiddleware]),
      });

      if (isEnabled) {
        epicMiddleware.run(countEpic);
      }

      store.dispatch(counter.actions.increment(1));

      expect(store.getState().counter).toBe(1);

      jest.advanceTimersByTime(1000);

      expect(store.getState().counter).toBe(isEnabled ? -1 : 1);
    }
  );

  // https://github.com/redux-observable/redux-observable/issues/706
  it.each([true, false])("can avoid returning empty of", (isEnabled) => {
    const counter = createSlice({
      name: "counter",
      initialState: 0,
      reducers: {},
    });

    const reducer = combineReducers({
      counter: counter.reducer,
    });

    type MyState = ReturnType<typeof reducer>;
    type MyEpic = Epic<AnyAction, AnyAction, MyState>;

    const countEpic: MyEpic = (action$) =>
      action$.pipe(
        filter((action) => {
          return action?.type === "foo";
        }),
        mergeMap(() => {
          return from<Promise<AnyAction>>(
            Promise.resolve({} as AnyAction)
          ).pipe(
            isEnabled
              ? map<AnyAction, AnyAction>(() => ({ type: "bar" }))
              : mergeMap(() => {
                  return of();
                })
          );
        })
      );

    const epicMiddleware = createEpicMiddleware<
      AnyAction,
      AnyAction,
      MyState
    >();

    const store = configureStore({
      reducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([epicMiddleware]),
    });

    epicMiddleware.run(countEpic);

    expect(() => store.dispatch({ type: "foo" })).not.toThrow();
  });
});

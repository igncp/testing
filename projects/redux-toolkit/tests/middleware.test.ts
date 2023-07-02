import {
  AnyAction,
  Reducer,
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

describe("createListenerMiddleware", () => {
  it.each([true, false])(
    "the sentinel is called depending if the middleware was started: %s",
    (started) => {
      const actionType = "foo";
      const actionPayload = "test123";

      const listenerSentinel = jest.fn();

      const listenerMiddleware = createListenerMiddleware();
      const store = configureStore({
        reducer: (() => 1) as Reducer,
        middleware: (getDefaultMiddleWare) => {
          return getDefaultMiddleWare({ thunk: false }).prepend(
            listenerMiddleware.middleware
          );
        },
      });

      if (started) {
        listenerMiddleware.startListening({
          type: actionType,
          effect: async (action: AnyAction) => {
            listenerSentinel(action.payload);
          },
        });
      }

      store.dispatch({ type: actionType, payload: actionPayload });

      expect(listenerSentinel.mock.calls).toEqual(
        started ? [[actionPayload]] : []
      );
    }
  );
});

describe("getDefaultMiddleware", () => {
  it.each([true, false])(
    "checks for immutability if using the default: %s",
    (withDefault) => {
      // It needs to be a custom reducer. If using `createSlice` or
      // `createReducer`, it will use Immer by default
      const exampleReducer = (state: any) => {
        return state || { foo: "bar" };
      };

      const store = configureStore({
        ...(!withDefault && { middleware: [] }),
        reducer: exampleReducer,
      });

      // The state is mutated before dispatching
      store.getState().foo = "baz";

      let expectation: any = expect(() => {
        store.dispatch({ type: "any" });
      });

      if (!withDefault) {
        expectation = expectation.not;
      }

      expectation.toThrow();
    }
  );
});

describe("custom middleware", () => {
  it("can run code before and after the reducer", () => {
    const sentinel = jest.fn();

    const exampleReducer = (state: any) => {
      sentinel("reducer");
      return {
        counter: (typeof state?.counter === "number" ? state.counter : -1) + 1,
      };
    };

    const store = configureStore({
      middleware: (gDM) =>
        gDM().concat(() => (next) => (action) => {
          sentinel("middleware before");
          next(action);
          sentinel("middleware after");
        }),
      reducer: exampleReducer,
    });

    expect(store.getState().counter).toEqual(0);

    jest.clearAllMocks();

    store.dispatch({ type: "noop" });

    expect(store.getState().counter).toEqual(1);
    expect(sentinel.mock.calls).toEqual([
      ["middleware before"],
      ["reducer"],
      ["middleware after"],
    ]);
  });
});

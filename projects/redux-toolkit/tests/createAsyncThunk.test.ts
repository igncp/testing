import {
  configureStore,
  createAsyncThunk,
  createListenerMiddleware,
  createSlice,
} from "@reduxjs/toolkit";

// https://redux-toolkit.js.org/api/createAsyncThunk
describe("createAsyncThunk", () => {
  it("creates an async action creator", (done) => {
    jest.useFakeTimers();

    interface User {
      property: string;
      id: number;
    }

    interface UsersState {
      entities: User[];
      loading: "idle" | "pending" | "succeeded" | "failed";
    }

    const fetchUserById = (id: number): Promise<User> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ property: "testProperty", id });
        }, 1000);
      });
    };

    const fetchUserByIdThunk = createAsyncThunk(
      "users/fetchByIdStatus",
      async (userId: number) => {
        return await fetchUserById(userId);
      }
    );

    const initialState: UsersState = {
      entities: [],
      loading: "idle",
    };

    const usersSlice = createSlice({
      name: "users",
      initialState,
      reducers: {},
      extraReducers: (builder) => {
        builder
          .addCase(fetchUserByIdThunk.pending, (state) => {
            state.loading = "pending";
          })
          .addCase(fetchUserByIdThunk.fulfilled, (state, action) => {
            state.entities.push(action.payload);
            state.loading = "succeeded";
          });
      },
    });

    const listenerMiddleware = createListenerMiddleware();

    listenerMiddleware.startListening({
      predicate: () => true,
      effect: (action) => {
        if (fetchUserByIdThunk.fulfilled.match(action)) {
          jest.advanceTimersToNextTimer();
        }
      },
    });

    const store = configureStore({
      reducer: usersSlice.reducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(listenerMiddleware.middleware),
    });

    expect(store.getState().loading).toEqual("idle");
    store.dispatch(fetchUserByIdThunk(123));

    setTimeout(() => {
      expect(store.getState().loading).toEqual("pending");
      expect(store.getState().entities).toHaveLength(0);
    }, 500);

    setTimeout(() => {
      expect(store.getState().loading).toEqual("succeeded");
      expect(store.getState().entities).toHaveLength(1);
      expect.assertions(5);
      done();
    }, 2000);

    // First when just some time has passed
    jest.advanceTimersToNextTimer();

    // The request has fulfilled
    jest.advanceTimersToNextTimer();
  });
});

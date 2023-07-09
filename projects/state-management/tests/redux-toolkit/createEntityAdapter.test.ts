import {
  configureStore,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";

describe("createEntityAdapter", () => {
  it("allows creating the expected actions, selectors, etc.", () => {
    type Movie = {
      id: string;
      name: string;
      synopsis?: string;
    };

    const moviesAdapter = createEntityAdapter<Movie>({
      sortComparer: (a, b) => a.name.localeCompare(b.name),
    });

    const moviesSlice = createSlice({
      name: "movies",
      initialState: moviesAdapter.getInitialState({
        loading: "idle",
      }),
      reducers: {
        addMovie: moviesAdapter.addOne,
        setMoviesLoading(state) {
          if (state.loading === "idle") {
            state.loading = "pending";
          }
        },
        receiveMovies(state, action) {
          if (state.loading === "pending") {
            moviesAdapter.setAll(state, action.payload);
            state.loading = "idle";
          }
        },
        updateMovie: moviesAdapter.updateOne,
      },
    });

    const { addMovie, setMoviesLoading, receiveMovies, updateMovie } =
      moviesSlice.actions;

    const store = configureStore({
      reducer: {
        movies: moviesSlice.reducer,
      },
    });

    expect(store.getState().movies).toEqual({
      entities: {},
      ids: [],
      loading: "idle",
    });

    type State = ReturnType<typeof store.getState>;
    const moviesSelectors = moviesAdapter.getSelectors<State>(
      (state) => state.movies
    );

    store.dispatch(addMovie({ id: "a", name: "First" }));
    expect(store.getState().movies).toEqual({
      ids: ["a"],
      entities: { a: { id: "a", name: "First" } },
      loading: "idle",
    });

    store.dispatch(
      updateMovie({
        id: "a",
        changes: { name: "First (altered)", synopsis: "Foo" },
      })
    );
    store.dispatch(setMoviesLoading());
    expect(store.getState().movies).toEqual({
      ids: ["a"],
      entities: { a: { id: "a", name: "First (altered)", synopsis: "Foo" } },
      loading: "pending",
    });

    // This overrideds the list of entities (since it is using `setAll`)
    store.dispatch(
      receiveMovies([
        { id: "b", name: "Movie 3" },
        { id: "c", name: "Movie 2", synopsis: "Bar" },
      ])
    );

    // Because they are sorted by name, "c" comes before "b"
    expect(moviesSelectors.selectIds(store.getState())).toEqual(["c", "b"]);

    expect(moviesSelectors.selectAll(store.getState())).toEqual([
      { id: "c", name: "Movie 2", synopsis: "Bar" },
      { id: "b", name: "Movie 3" },
    ]);

    expect(store.getState().movies).toEqual({
      ids: ["c", "b"],
      entities: {
        b: { id: "b", name: "Movie 3" },
        c: { id: "c", name: "Movie 2", synopsis: "Bar" },
      },
      loading: "idle",
    });
  });
});

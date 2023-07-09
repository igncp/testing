import { createAction, createSlice } from "@reduxjs/toolkit";

describe("createAction", () => {
  it("can return the action type with .toString()", () => {
    const fooSlice = createSlice({
      name: "foo",
      initialState: null,
      reducers: {
        doFoo: () => null,
      },
    });
    const { doFoo } = fooSlice.actions;
    const doBar = createAction("bar");

    expect(doFoo().type).toEqual("foo/doFoo");
    expect(doFoo.toString()).toEqual("foo/doFoo");
    expect(doBar.toString()).toEqual("bar");
  });

  it("accepts the payload as a type", () => {
    const doFoo = createAction<"foo">("actionA");

    doFoo(
      // @ts-expect-error The passed type only accepts "foo"
      "bar"
    );

    expect(doFoo("foo").payload).toEqual("foo");
  });
});

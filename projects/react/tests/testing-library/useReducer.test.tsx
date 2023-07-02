import React, { useReducer } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

type State = {
  status: "initial" | "clicked";
};

const ReducerComp = () => {
  const [{ status }, dispatch] = useReducer(
    (state: State, action: any) => {
      if (action.type === "click") {
        return { status: "clicked" } as State;
      }

      return state;
    },
    { status: "initial" } as State
  );

  return (
    <div>
      <h1>
        {status === "initial"
          ? "Initial"
          : status === "clicked"
          ? "Clicked"
          : ""}
      </h1>
      <button onClick={() => dispatch({ type: "click" })}>Click me</button>
    </div>
  );
};

describe("ReducerComp", () => {
  it("has the expected initial content", async () => {
    render(<ReducerComp />);

    await screen.findByRole("heading");

    expect(screen.getByRole("heading")).toHaveTextContent("Initial");
  });

  it("has the expected content when clicked", async () => {
    render(<ReducerComp />);

    await screen.findByRole("heading");

    await userEvent.click(screen.getByText("Click me"));

    expect(screen.getByRole("heading")).toHaveTextContent("Clicked");
  });
});

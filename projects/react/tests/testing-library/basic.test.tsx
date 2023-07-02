import React, { useEffect, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

const HeadingButton = () => {
  const [isClicked, setIsClicked] = useState(false);

  return (
    <div>
      {isClicked && <h1>Hello there</h1>}
      <button onClick={() => setIsClicked(true)} disabled={isClicked}>
        Click me
      </button>
    </div>
  );
};

const DivEffectHook = () => {
  const [isDisplayed, setIsDisplayed] = useState(false);

  useEffect(() => {
    setIsDisplayed(true);
  }, []);

  return <div>{isDisplayed && <h1>Hello there</h1>}</div>;
};

describe("HeadingButton", () => {
  it("can handle click", async () => {
    render(<HeadingButton />);

    expect(screen.getByRole("button")).not.toBeDisabled();

    await userEvent.click(screen.getByText("Click me"));

    await screen.findByRole("heading");

    expect(screen.getByRole("heading")).toHaveTextContent("Hello there");
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("DivEffectHook", () => {
  it("can run the hook", async () => {
    render(<DivEffectHook />);

    await screen.findByRole("heading");

    expect(screen.getByRole("heading")).toHaveTextContent("Hello there");
  });
});

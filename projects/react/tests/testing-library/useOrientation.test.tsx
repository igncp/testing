import React from "react";
import { render, screen } from "@testing-library/react";
import { useOrientation } from "react-use";
import "@testing-library/jest-dom";

const Demo = () => {
  const state = useOrientation();

  return <h1>{JSON.stringify(state, null, 2)}</h1>;
};

let defaultOrientation: ScreenOrientation;

beforeEach(() => {
  defaultOrientation = window.screen.orientation;
});

afterAll(() => {
  Object.defineProperty(window.screen, "orientation", {
    configurable: true,
    value: defaultOrientation,
  });
});

// More tests: https://github.com/streamich/react-use/blob/master/tests/useOrientation.test.ts
describe("useOrientation", () => {
  it.each([["portrait-primary"], ["landscape-primary"]])(
    "gets the value in window: %s",
    async (orientationType) => {
      const angle = Math.random();
      Object.defineProperty(window.screen, "orientation", {
        configurable: true,
        value: { type: orientationType, angle },
      });

      render(<Demo />);

      await screen.findByRole("heading");

      const heading = screen.getByRole("heading");

      expect(JSON.parse(heading.innerHTML)).toEqual({
        angle,
        type: orientationType,
      });
    }
  );
});

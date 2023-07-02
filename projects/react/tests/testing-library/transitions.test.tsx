import { Transition, TransitionStatus } from "react-transition-group";
import React, { useRef } from "react";
import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

const duration = 1000;

const defaultStyle = {
  transition: `opacity ${duration}ms ease-in-out`,
  opacity: 0,
};

const transitionStyles: Record<TransitionStatus, { opacity: number }> = {
  entered: { opacity: 1 },
  entering: { opacity: 1 },
  exited: { opacity: 0 },
  exiting: { opacity: 0 },
  unmounted: { opacity: 0 },
};

const Fade = ({ in: inProp }: { in: boolean }) => {
  const nodeRef = useRef(null);
  return (
    <Transition nodeRef={nodeRef} in={inProp} timeout={duration}>
      {(state) => (
        <h1
          ref={nodeRef}
          style={{
            ...defaultStyle,
            ...transitionStyles[state],
          }}
        >
          State: {state}
        </h1>
      )}
    </Transition>
  );
};

describe("Transition", () => {
  it("starts in entered state", async () => {
    render(<Fade in />);

    expect(screen.getByRole("heading")).toHaveTextContent("State: entered");
    expect(screen.getByRole("heading")).toHaveStyle({ opacity: 1 });
  });

  it("changes the status over time", async () => {
    jest.useFakeTimers();

    const { rerender } = render(<Fade in />);

    expect(screen.getByRole("heading")).toHaveTextContent("State: entered");
    expect(screen.getByRole("heading")).toHaveStyle({ opacity: 1 });

    rerender(<Fade in={false} />);

    expect(screen.getByRole("heading")).toHaveTextContent("State: exiting");

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByRole("heading")).toHaveTextContent("State: exiting");

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByRole("heading")).toHaveTextContent("State: exited");
  });
});

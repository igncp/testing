import {
  atom,
  atomFamily,
  isRecoilValue,
  RecoilLoadable,
  RecoilRoot,
  selector,
  useRecoilState,
  useRecoilTransaction_UNSTABLE,
  useRecoilValue,
  useResetRecoilState,
} from "recoil";
import { Subject } from "rxjs";
import React, { useEffect } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Form, RecoilObserver } from "./test-utils";

// https://recoiljs.org/docs/guides/testing
// https://recoiljs.org/docs/api-reference/core/RecoilRoot

test("when the input has a change event it reflects in the recoil observer", () => {
  const onChange = jest.fn();
  const nameState = atom({
    key: "nameAtom",
    default: "",
  });
  const testId = "name_input";

  render(
    <RecoilRoot>
      <RecoilObserver node={nameState} onChange={onChange} />
      <Form nameState={nameState} testId={testId} />
    </RecoilRoot>
  );

  const component = screen.getByTestId(testId);

  fireEvent.change(component, { target: { value: "Form Changed" } });

  expect((onChange as jest.Mock).mock.calls).toEqual([[""], ["Form Changed"]]);
  expect(nameState.key).toEqual("nameAtom");
});

test("when the input has a change event and using a selector it reflects in the recoil observer", () => {
  const onChange = jest.fn();
  const nameState = atom({
    key: "nameAtom:underscore",
    default: "",
  });
  const nameSpacesToUnderscore = selector({
    key: "SpacesToUnderscore",
    get: ({ get }) => {
      const currentName = get(nameState);

      return currentName.replace(/ /g, "_");
    },
  });
  const testId = "name_input";
  const Comp = () => {
    const parsedValue = useRecoilValue(nameSpacesToUnderscore);

    return <div data-testid="parsed_value">{parsedValue}</div>;
  };

  render(
    <RecoilRoot>
      <RecoilObserver node={nameSpacesToUnderscore} onChange={onChange} />
      <Form nameState={nameState} testId={testId} />
      <Comp />
    </RecoilRoot>
  );

  const component = screen.getByTestId(testId);
  fireEvent.change(component, { target: { value: "Form Changed" } });

  const valueComp = screen.getByTestId("parsed_value");

  expect(valueComp.innerHTML).toEqual("Form_Changed");
});

test("when using an `atomFamily`, it only re-renders when changing the listened id", () => {
  const nameState = atomFamily({
    key: "nameAtom:family",
    default: "",
  });
  const sentinel = jest.fn();
  const testId = "someTestId";
  const createComp = (componentId: string) => () => {
    const [nameValue, setNameValue] = useRecoilState(nameState(componentId));
    useEffect(() => {
      const eventName = "sample" + componentId;
      const listener = () => {
        setNameValue("sample");
      };
      window.addEventListener(eventName, listener);

      return () => {
        window.removeEventListener(eventName, listener);
      };
    }, []);

    sentinel(componentId);

    return <div data-testid={testId}>{nameValue}</div>;
  };
  const Comp1 = createComp("1");
  const Comp2 = createComp("2");
  const RootComp = () => {
    return (
      <RecoilRoot>
        <Comp1 />
        <Comp2 />
      </RecoilRoot>
    );
  };

  render(<RootComp />);

  // Initiall both components are rendered once
  expect(sentinel.mock.calls).toEqual([["1"], ["2"]]);

  act(() => {
    // This should trigger a re-render of Comp1 but not of Comp2
    window.dispatchEvent(new Event("sample1"));
  });

  expect(sentinel.mock.calls).toEqual([["1"], ["2"], ["1"]]);

  act(() => {
    // Similarly, this should trigger a re-render of the corresponding Comp2,
    // but not of Comp1
    window.dispatchEvent(new Event("sample2"));
  });

  expect(sentinel.mock.calls).toEqual([["1"], ["2"], ["1"], ["2"]]);
});

describe("Loadable", () => {
  it("resolves to the expected values", async () => {
    const loadable1 = RecoilLoadable.all([
      1,
      RecoilLoadable.of(2),
      Promise.resolve(3),
    ]);

    expect(loadable1.state).toBe("loading");
    expect(await loadable1.toPromise()).toEqual([1, 2, 3]);
  });
});

describe("useRecoilTransaction_UNSTABLE", () => {
  it("performs all updates specified inside the transacion in one render", () => {
    const headingState = atom({
      key: "heading",
      default: 1,
    });
    const positionState = atom({
      key: "position",
      default: { x: 1, y: 1 },
    });

    const emitter = new Subject<number>();
    const sentinel = jest.fn();

    type Props = {
      useOnRender?: (props: {
        position: typeof positionState["__tag"][number];
        heading: typeof headingState["__tag"][number];
        goForward: (distance: number) => void;
      }) => void;
    };

    const Comp = ({ useOnRender }: Props) => {
      const position = useRecoilValue(positionState);
      const heading = useRecoilValue(headingState);

      const goForward = useRecoilTransaction_UNSTABLE(
        ({ get, set }) =>
          (distance: number) => {
            const heading = get(headingState);
            const position = get(positionState);
            set(positionState, {
              x: position.x + Math.cos(heading) * distance,
              y: position.y + Math.sin(heading) * distance,
            });
            set(headingState, heading + 1);
          }
      );

      useOnRender?.({ position, heading, goForward });

      return null;
    };

    render(
      <RecoilRoot>
        <Comp
          useOnRender={({ goForward, position, heading }) => {
            useEffect(() => {
              const subscription = emitter.subscribe((distance) => {
                goForward(distance);
              });

              return () => {
                subscription.unsubscribe();
              };
            }, []);

            sentinel({ position, heading });
          }}
        />
      </RecoilRoot>
    );

    const getLastCall = () => sentinel.mock.calls.slice(-1)[0]?.[0];

    expect(getLastCall()).toEqual({ position: { x: 1, y: 1 }, heading: 1 });

    act(() => {
      emitter.next(10);
    });

    expect(getLastCall()).toEqual({
      position: { x: expect.closeTo(6.403, 3), y: expect.closeTo(9.415, 3) },
      heading: 2,
    });

    // There was only one extra render even if multiple atom values were
    // updated
    expect(sentinel.mock.calls.length).toEqual(2);
  });
});

describe("isRecoilValue", () => {
  it("returns true for the expected types", () => {
    const counter = atom({
      key: "myCounter",
      default: 0,
    });

    const strCounter = selector({
      key: "myCounterStr",
      get: ({ get }) => String(get(counter)),
    });

    expect(isRecoilValue(counter)).toEqual(true);

    // Selectors are also considered recoil values
    expect(isRecoilValue(strCounter)).toEqual(true);

    expect(isRecoilValue(5)).toEqual(false);
    expect(isRecoilValue({})).toEqual(false);
  });
});

describe("useResetRecoilState", () => {
  it("has no rerenders and performs the expected action", () => {
    const renderSentinel = jest.fn();
    const valueSentinel = jest.fn();

    const counter = atom({
      key: "useResetRecoilState:myCounter",
      default: 0,
    });

    const Comp = ({ useOnRender }: { useOnRender: () => void }) => {
      const reset = useResetRecoilState(counter);

      useOnRender();

      return <button onClick={reset}>Reset</button>;
    };

    const Comp2 = () => {
      const [value, setValue] = useRecoilState(counter);
      valueSentinel(value);
      useEffect(() => {
        setValue(1);
      }, []);
      return null;
    };

    render(
      <RecoilRoot>
        <Comp useOnRender={renderSentinel} />
        <Comp2 />
      </RecoilRoot>
    );

    // Only one initial render for Comp, and two for Comp2 which sets the value
    expect(renderSentinel.mock.calls).toEqual([[]]);
    expect(valueSentinel.mock.calls).toEqual([[0], [1]]);

    const button = screen.getByText("Reset");

    fireEvent.click(button);

    // There are no extra renders for Comp, since it is not subscribed to the
    // value. For Comp2 there is an extra render with the default value.
    expect(renderSentinel.mock.calls).toEqual([[]]);
    expect(valueSentinel.mock.calls).toEqual([[0], [1], [0]]);
  });
});

import {
  atom,
  atomFamily,
  RecoilLoadable,
  RecoilRoot,
  selector,
  useRecoilState,
  useRecoilValue,
} from "recoil";
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

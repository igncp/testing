import {
  RecoilState,
  useRecoilValue,
  useRecoilState,
  RecoilValueReadOnly,
} from "recoil";
import React, { useEffect } from "react";

type ObserverProps<A> = {
  node: RecoilState<A> | RecoilValueReadOnly<A>;
  onChange: (value: A) => void;
};

export const RecoilObserver = <A,>({ node, onChange }: ObserverProps<A>) => {
  const value = useRecoilValue(node);
  useEffect(() => onChange(value), [onChange, value]);

  return null;
};

type FormProps = {
  extraHooks?: () => void;
  nameState: RecoilState<string>;
  testId: string;
};

export const Form = ({ nameState, testId, extraHooks }: FormProps) => {
  const [name, setName] = useRecoilState(nameState);

  extraHooks?.();

  return (
    <form>
      <input
        data-testid={testId}
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
    </form>
  );
};

import { render } from "@testing-library/react";
import React from "react";
import { atom, snapshot_UNSTABLE, RecoilRoot, useRecoilSnapshot } from "recoil";

describe("snapshot_UNSTABLE", () => {
  it("gets the existing state", async () => {
    const nameState = atom({
      key: "snapshot:snapshot_UNSTABLE:nameAtom",
      default: "defaultName",
    });

    const testSnapshot = snapshot_UNSTABLE();

    expect(testSnapshot.getLoadable(nameState).contents).toBe("defaultName");
    expect(await testSnapshot.getPromise(nameState)).toBe("defaultName");
    expect(testSnapshot.getID()).toBe(0);
    expect(testSnapshot.isRetained()).toBe(true);
  });
});

describe("useRecoilSnapshot", () => {
  it("works in the same way as snapshot_UNSTABLE", async () => {
    const nameState = atom({
      key: "snapshot:useRecoilSnapshot:nameAtom",
      default: "defaultName2",
    });
    const sentinel = jest.fn();
    const Comp = () => {
      const snapshot = useRecoilSnapshot();

      sentinel(snapshot);

      return null;
    };

    render(
      <RecoilRoot>
        <Comp />
      </RecoilRoot>
    );

    const [testSnapshot] = sentinel.mock.calls[0];

    expect(testSnapshot.getLoadable(nameState).contents).toBe("defaultName2");
    expect(await testSnapshot.getPromise(nameState)).toBe("defaultName2");

    // The ID is increaded by one compared to the previous test. This assertion
    // makes the tests dependant on the order, but I am not aware of a way to
    // reset it
    expect(testSnapshot.getID()).toBe(1);
    expect(testSnapshot.isRetained()).toBe(true);
  });
});

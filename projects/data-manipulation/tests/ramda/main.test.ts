import {
  add,
  allPass,
  always,
  ascend,
  collectBy,
  prop,
  propEq,
  sort,
} from "ramda";

// https://ramdajs.com/docs/

// Many of these examples are copied directly from the docs, but normally
// adding the extra types

test("add", () => {
  const t = add(10);

  expect(t(5)).toBe(15);
  expect(t(10)).toBe(20);
});

test("always", () => {
  const t = always("Tee");

  Array.from({ length: 10 }).forEach(() => {
    expect(t()).toBe("Tee");
  });
});

test("allPass", () => {
  type BaseObject = {
    rank: string;
    suit: string;
    [key: string]: unknown;
  };
  type BooleanFunction = (x: BaseObject) => boolean;

  const isQueen = propEq("Q", "rank") as BooleanFunction;
  const isSpade = propEq("S", "suit") as BooleanFunction;
  const isQueenOfSpades = allPass([isQueen, isSpade]);

  expect(isQueenOfSpades({ rank: "Q", suit: "D", foo: 1 })).toBe(false);
  expect(isQueenOfSpades({ rank: "Q", suit: "S", foo: false })).toBe(true);
});

test("ascend", () => {
  const byAge = ascend(prop<"age">("age"));
  const people = [
    { name: "Emma", age: 70 },
    { name: "Peter", age: 78 },
    { name: "Mikhail", age: 62 },
  ];
  const peopleByYoungestFirst = sort(byAge, people);

  expect(peopleByYoungestFirst.map(prop("name"))).toEqual([
    "Mikhail",
    "Emma",
    "Peter",
  ]);
});

test("collectBy", () => {
  const list = [
    { foo: 1, id: 0 },
    { foo: 1, id: 1 },
    { foo: 2, id: 2 },
  ];

  expect(collectBy(prop("foo"), list)).toEqual([
    [
      { foo: 1, id: 0 },
      { foo: 1, id: 1 },
    ],
    [{ foo: 2, id: 2 }],
  ]);

  expect(collectBy(prop("id"), list)).toEqual([
    [{ foo: 1, id: 0 }],
    [{ foo: 1, id: 1 }],
    [{ foo: 2, id: 2 }],
  ]);

  expect(collectBy(prop("nonExistent") as any, list)).toEqual([
    [
      { foo: 1, id: 0 },
      { foo: 1, id: 1 },
      { foo: 2, id: 2 },
    ],
  ]);
});

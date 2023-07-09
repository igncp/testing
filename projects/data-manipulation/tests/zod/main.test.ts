import { z } from "zod";
describe("basic examples", () => {
  it("should return the expected values from examples #1", () => {
    const mySchema = z.string();

    expect(mySchema.parse("tuna")).toEqual("tuna");
    expect(() => mySchema.parse(12)).toThrow();

    expect(mySchema.safeParse("tuna")).toEqual({ success: true, data: "tuna" });
    expect(mySchema.safeParse(12)).toEqual({
      success: false,
      error: expect.any(Error),
    });

    const User = z.object({
      username: z.string(),
    });

    type TUser = z.infer<typeof User>;

    const user: TUser = { username: "Ludwig" };

    expect(User.parse(user)).toEqual({ username: "Ludwig" });
  });

  it("can coerce types with the .coerce method", () => {
    const schema = z.coerce.string();

    expect(schema.parse("tuna")).toEqual("tuna");
    expect(schema.parse(12)).toEqual("12");
    expect(schema.parse(true)).toEqual("true");

    const emailSchema = z.coerce.string().email().min(5);

    expect(() => emailSchema.parse("tuna")).toThrow();
    expect(() => emailSchema.parse("awrongemail@a")).toThrow();
    expect(emailSchema.parse("foo@bar.com")).toEqual("foo@bar.com");
  });

  it("can verify literals", () => {
    const tuna = z.literal("tuna");

    expect(tuna.parse("tuna")).toEqual("tuna");
    expect(() => tuna.parse("tunas")).toThrow();
  });

  it("has multiple validators", () => {
    const safeUrlLikeSchema = z
      .string()
      .startsWith("https://", { message: "Must provide secure URL" });

    expect(safeUrlLikeSchema.parse("https://google.com")).toEqual(
      "https://google.com"
    );
    expect(() => safeUrlLikeSchema.parse("http://google.com")).toThrow();
  });

  it("can handle enums", () => {
    const FishEnum = z.enum(["Salmon", "Tuna", "Trout"]);
    type TFishEnum = z.infer<typeof FishEnum>;
    const Salmon: TFishEnum = "Salmon";

    expect(FishEnum.enum.Salmon).toEqual(Salmon);
  });

  it("can handle objects", () => {
    const Dog = z.object({
      name: z.string(),
      age: z.number(),
    });

    type TDog = z.infer<typeof Dog>;
    const dog: TDog = { name: "Fido", age: 12 };

    expect(Dog.parse(dog)).toEqual(dog);
    expect(Dog.shape.name.parse("Fido")).toEqual("Fido");

    const DogWithBreed = Dog.extend({
      breed: z.string(),
    });

    expect(() => DogWithBreed.parse(dog)).toThrow();

    const PartialDog = Dog.partial();

    expect(PartialDog.parse({ name: "Fido" })).toEqual({ name: "Fido" });

    // Extra keys are removed
    expect(Dog.parse({ ...dog, extra: "extra" })).toEqual(dog);
    // They can be kept with `.passthrough()`
    expect(Dog.passthrough().parse({ ...dog, extra: "extra" })).toEqual({
      ...dog,
      extra: "extra",
    });
    // They can also be detected with `.strict()`
    expect(() => Dog.strict().parse({ ...dog, extra: "extra" })).toThrow();
  });

  it("can handle unions", () => {
    const stringOrNumber = z.union([z.string(), z.number()]);

    expect(stringOrNumber.parse("foo")).toEqual("foo");
    expect(stringOrNumber.parse(14)).toEqual(14);
    expect(() => stringOrNumber.parse(true)).toThrow();
  });

  it("can validate json", () => {
    const literalSchema = z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
    ]);
    type Literal = z.infer<typeof literalSchema>;
    type Json = Literal | { [key: string]: Json } | Json[];
    const jsonSchema: z.ZodType<Json> = z.lazy(() =>
      z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
    );

    expect(jsonSchema.parse({ foo: [1, 2, 3] })).toEqual({ foo: [1, 2, 3] });
    expect(() => jsonSchema.parse({ foo: new Set([1, 2]) })).toThrow();
  });

  it("supports custom schemas", () => {
    const px = z.custom<`${number}px`>((val) => {
      return /^\d+px$/.test(val as string);
    });

    type px = z.infer<typeof px>;

    expect(px.parse("42px")).toEqual("42px");
    expect(() => px.parse("42vw")).toThrow();
    const relaxedPX = px.catch("0px");

    expect(relaxedPX.parse("42vw")).toEqual("0px");
  });
});

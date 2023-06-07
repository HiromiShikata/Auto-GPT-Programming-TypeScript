import { fixErrorCliHandler } from "./FixErrorHandler";
jest.setTimeout(10 * 60 * 1000);

describe("FixErrorHandler", () => {
  test("success", async () => {
    const fixErrorHandler = await fixErrorCliHandler();
    expect(fixErrorHandler).toEqual(undefined);
  });
});

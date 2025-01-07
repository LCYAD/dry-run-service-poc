import { testFunctionRouter } from "../testFunction";

describe("testFunction /api/test-function", () => {
  describe("GET /output-string/old", () => {
    let mockedFetchjest: jest.SpyInstance;

    beforeEach(() => {
      mockedFetchjest = jest.spyOn(global, "fetch").mockImplementation();
    });
    test("should return text response", async () => {
      const res = await testFunctionRouter.request(
        "/api/test-function/output-string/old",
        {
          method: "GET",
        },
      );
      expect(res.status).toBe(200);
      expect(mockedFetchjest).toHaveBeenCalled();
      expect(await res.text()).toEqual("test");
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });
  describe("GET /output-string/new", () => {
    test("should return text response", async () => {
      const res = await testFunctionRouter.request(
        "/api/test-function/output-string/new",
        {
          method: "GET",
        },
      );
      expect(res.status).toBe(200);
      expect(await res.text()).toEqual("test");
    });
  });
});

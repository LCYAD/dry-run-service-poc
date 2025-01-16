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
  describe("GET /output-json/old", () => {
    let mockedFetchjest: jest.SpyInstance;

    beforeEach(() => {
      mockedFetchjest = jest.spyOn(global, "fetch").mockImplementation();
    });

    test("should return json response with default value", async () => {
      const res = await testFunctionRouter.request(
        "/api/test-function/output-json/old",
        {
          method: "GET",
        },
      );
      expect(res.status).toBe(200);
      expect(mockedFetchjest).toHaveBeenCalled();
      expect(await res.json()).toEqual({ result: 1 });
    });

    test("should return json response with provided value", async () => {
      const res = await testFunctionRouter.request(
        "/api/test-function/output-json/old?val=5",
        {
          method: "GET",
        },
      );
      expect(res.status).toBe(200);
      expect(mockedFetchjest).toHaveBeenCalled();
      expect(await res.json()).toEqual({ result: 6 });
    });

    test("should throw validation error if val is not a number", async () => {
      const res = await testFunctionRouter.request(
        "/api/test-function/output-json/old?val=test",
        {
          method: "GET",
        },
      );
      expect(res.status).toBe(400);
      expect(mockedFetchjest).not.toHaveBeenCalled();
      expect(await res.json()).toEqual({
        success: false,
        error: {
          issues: [
            {
              code: "invalid_type",
              expected: "number",
              received: "nan",
              path: ["val"],
              message: "Expected number, received nan",
            },
          ],
          name: "ZodError",
        },
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe("GET /output-json/new", () => {
    test("should return json response with default value", async () => {
      const res = await testFunctionRouter.request(
        "/api/test-function/output-json/new",
        {
          method: "GET",
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ result: 1 });
    });

    test("should return json response with provided value", async () => {
      const res = await testFunctionRouter.request(
        "/api/test-function/output-json/new?val=5",
        {
          method: "GET",
        },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ result: 6 });
    });

    test("should throw validation error if val is not a number", async () => {
      const res = await testFunctionRouter.request(
        "/api/test-function/output-json/old?val=test",
        {
          method: "GET",
        },
      );
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        success: false,
        error: {
          issues: [
            {
              code: "invalid_type",
              expected: "number",
              received: "nan",
              path: ["val"],
              message: "Expected number, received nan",
            },
          ],
          name: "ZodError",
        },
      });
    });
  });
});

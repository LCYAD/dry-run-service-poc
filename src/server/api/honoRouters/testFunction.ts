import { Hono } from "hono";

export const testFunctionRouter = new Hono().basePath("/api/test-function");

testFunctionRouter
  .get("/output-string/old", async (c) => {
    await fetch("http://localhost:3000/api/job/test-string-equal", {
      method: "POST",
      body: JSON.stringify({
        expectedRes: "test",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return c.text("test", 200);
  })
  .get("/output-string/new", async (c) => {
    return c.text("test", 200);
  });

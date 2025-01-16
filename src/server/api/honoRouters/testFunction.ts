import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

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
  })
  .get(
    "/output-json/old",
    zValidator(
      "query",
      z.object({
        val: z.coerce.number().optional().default(0),
      }),
    ),
    async (c) => {
      const { val } = c.req.valid("query");
      const result = val + 1;
      await fetch("http://localhost:3000/api/job/test-json-equal", {
        method: "POST",
        body: JSON.stringify({
          input: {
            val,
          },
          expectedRes: {
            result,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return c.json({ result }, 200);
    },
  )
  .get(
    "/output-json/new",
    zValidator(
      "query",
      z.object({
        val: z.coerce.number().optional().default(0),
      }),
    ),
    async (c) => {
      const { val } = c.req.valid("query");
      const result = val + 1;
      return c.json({ result }, 200);
    },
  );

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { testStringEqualQueue } from "@/server/bullmq/testStringEqual";
import { nanoid } from "nanoid";

const job = new Hono().basePath("/api/job");

const jobTestStringPostInputSchema = z.object({
  expectedRes: z.string(),
});

job.post(
  "/test-string-equal",
  zValidator("json", jobTestStringPostInputSchema),
  async (c) => {
    const body = c.req.valid("json");
    await testStringEqualQueue.add(`string-equal-${nanoid(10)}`, body);
    return c.json(
      {
        message: "Job Created!",
      },
      201,
    );
  },
);

export const jobRouter = job;

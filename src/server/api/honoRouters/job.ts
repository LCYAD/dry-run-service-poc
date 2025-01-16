import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { nanoid } from "nanoid";
import { getBullQueue } from "@/server/util/queue";
import { QUEUE_NAMES } from "@/server/bullmq/constant";

export const jobRouter = new Hono().basePath("/api/job");

const jobTestStringPostInputSchema = z.object({
  expectedRes: z.string(),
});

const jobTestJsonPostInputSchema = z.object({
  input: z.object({ val: z.number() }),
  expectedRes: z.object({ result: z.number() }),
});

jobRouter
  .post(
    "/test-string-equal",
    zValidator("json", jobTestStringPostInputSchema),
    async (c) => {
      const body = c.req.valid("json");
      const queue = getBullQueue(QUEUE_NAMES.TEST_STRING_EQUAL);
      if (!queue) {
        throw new HTTPException(500, {
          message: "Cannot find the right queue to insert job!",
        });
      }
      await queue.add(`string-equal-${nanoid(10)}`, body);
      return c.json(
        {
          message: "Job Created!",
        },
        201,
      );
    },
  )
  .post(
    "/test-json-equal",
    zValidator("json", jobTestJsonPostInputSchema),
    async (c) => {
      const body = c.req.valid("json");
      // TODO: create queue and worker
      console.log(body);
      return c.json(
        {
          message: "Job Created!",
        },
        201,
      );
    },
  );

export type StringEqualQueueInput = z.infer<
  typeof jobTestStringPostInputSchema
>;

export type JsonEqualQueueInput = z.infer<typeof jobTestJsonPostInputSchema>;

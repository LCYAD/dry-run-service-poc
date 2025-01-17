import { Queue, Worker, type Job } from "bullmq";
import _ from "lodash";
import { connection } from "./ioredis";
import type { JsonEqualQueueInput } from "../api/honoRouters/job";
import { errorHandlingQueue } from "./errorHandler";
import { QUEUE_NAMES } from "./constant";

export const testJsonEqualQueue = new Queue(QUEUE_NAMES.TEST_JSON_EQUAL, {
  connection,
});

// directly setting up the worker inside the queue
new Worker(
  QUEUE_NAMES.TEST_JSON_EQUAL,
  async (job: Job<JsonEqualQueueInput, boolean>) => {
    const res = await fetch(
      `http://localhost:3000/api/test-function/output-json/new?${new URLSearchParams(
        {
          val: job.data.input?.val?.toString() ?? "",
        },
      ).toString()}`,
      {
        method: "GET",
      },
    );
    const resJson = (await res.json()) as Record<string, unknown>;
    const expectedRes = job.data.expectedRes;
    if (!_.isEqual(resJson, expectedRes)) {
      await errorHandlingQueue.add(`error-${job.name}`, {
        ...job.data,
        actualRes: resJson,
        failedJobId: job.name,
        jobName: QUEUE_NAMES.TEST_JSON_EQUAL,
      });
    }
    return true;
  },
  { connection },
);

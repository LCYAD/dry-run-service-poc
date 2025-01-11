import { Queue, Worker, type Job } from "bullmq";
import { connection } from "./ioredis";
import type { StringEqualQueueInput } from "../api/honoRouters/job";
import { errorHandlingQueue } from "./errorHandler";
import { QUEUE_NAMES } from "./constant";

export const testStringEqualQueue = new Queue(QUEUE_NAMES.TEST_STRING_EQUAL, {
  connection,
});

// directly setting up the worker inside the queue
new Worker(
  QUEUE_NAMES.TEST_STRING_EQUAL,
  async (job: Job<StringEqualQueueInput, boolean>) => {
    const res = await fetch(
      "http://localhost:3000/api/test-function//output-string/new",
      {
        method: "GET",
      },
    );
    const returnedStr = await res.text();
    const expectedRes = job.data.expectedRes;
    if (returnedStr !== expectedRes) {
      await errorHandlingQueue.add(`error-${job.name}`, {
        ...job.data,
        actualRes: returnedStr,
        failedJobId: job.name,
        jobName: QUEUE_NAMES.TEST_STRING_EQUAL,
      });
    }
    return true;
  },
  { connection },
);

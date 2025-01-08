import { Queue, Worker, type Job } from "bullmq";
import { connection } from "./ioredis";
import type { StringEqualQueueInput } from "../api/honoRouters/job";
import { errorHandlingQueue } from "./errorHandler";

const queueName = "test-string-equal";

export const testStringEqualQueue = new Queue(queueName, {
  connection,
});

// directly setting up the worker inside the queue
new Worker(
  queueName,
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
      await errorHandlingQueue.add(job.name, { ...job.data });
    }
    return true;
  },
  { connection },
);

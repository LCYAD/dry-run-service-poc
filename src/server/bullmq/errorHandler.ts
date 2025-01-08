import { Queue, Worker, type Job } from "bullmq";
import { connection } from "./ioredis";

const queueName = "error-handling";

export const errorHandlingQueue = new Queue(queueName, {
  connection,
});

type ErrorHandlingInput = {
  input?: unknown;
  expectedRes: string | Record<string, unknown>;
};

// directly setting up the worker inside the queue
new Worker(
  queueName,
  async (job: Job<ErrorHandlingInput, boolean>) => {
    console.log(
      `Handling error ${job.name}: with payload: ${JSON.stringify(job.data)}`,
    );
    // TODO: handling s3 upload payload
    return true;
  },
  { connection },
);

import { Queue, Worker, type Job } from "bullmq";
import { connection } from "./ioredis";
import { uploadJsonToS3 } from "../s3/s3";

const queueName = "error-handling";

export const errorHandlingQueue = new Queue(queueName, {
  connection,
});

type ErrorHandlingInput = {
  failedJobId: string;
  input?: unknown;
  expectedRes: string | Record<string, unknown>;
  actualRes: string | Record<string, unknown>;
};

// directly setting up the worker inside the queue
new Worker(
  queueName,
  async (job: Job<ErrorHandlingInput, boolean>) => {
    console.log(
      `Handling error ${job.name}: with payload: ${JSON.stringify(job.data)}`,
    );
    await uploadJsonToS3(
      `error-handling/${job.name}/${job.data.failedJobId}.json`,
      job.data,
    );
    // TODO: create entry to DB
    return true;
  },
  { connection },
);

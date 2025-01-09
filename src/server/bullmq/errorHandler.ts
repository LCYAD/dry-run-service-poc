import { Queue, Worker, type Job } from "bullmq";
import { connection } from "./ioredis";
import { encryptAndUploadJsonToS3 } from "../util/s3";
import { generateKeyPair } from "../util/genSecret";

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
    const { publicKey } = generateKeyPair(2048);

    const key = `error-handling/${job.name}/${job.data.failedJobId}.json`;

    await encryptAndUploadJsonToS3(key, job.data, publicKey);

    // TODO: create entry to DB
    return true;
  },
  { connection },
);

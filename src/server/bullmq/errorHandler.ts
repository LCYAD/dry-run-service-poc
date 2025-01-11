import { Queue, Worker, type Job } from "bullmq";
import { connection } from "./ioredis";
import { encryptAndUploadJsonToS3 } from "../util/s3";
import { generateKeyPair } from "../util/genSecret";
import { db } from "../db";
import { failedJobs } from "../db/schema";

const queueName = "error-handling";

export const errorHandlingQueue = new Queue(queueName, {
  connection,
});

type ErrorHandlingInput = {
  failedJobId: string;
  input?: unknown;
  expectedRes: string | Record<string, unknown>;
  actualRes: string | Record<string, unknown>;
  jobName: string;
};

// directly setting up the worker inside the queue
new Worker(
  queueName,
  async (job: Job<ErrorHandlingInput, boolean>) => {
    const { publicKey } = generateKeyPair(2048);
    const s3Key = `error-handling/${job.data.jobName}/${job.data.failedJobId}.json`;

    await encryptAndUploadJsonToS3(s3Key, job.data, publicKey);

    await db.insert(failedJobs).values({
      jobId: job.data.failedJobId,
      jobName: job.data.jobName,
      s3Key,
    });

    return true;
  },
  { connection },
);

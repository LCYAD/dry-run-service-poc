import { Queue, Worker, type Job } from "bullmq";
import crypto from "crypto";
import { connection } from "./ioredis";
import { uploadToS3 } from "../util/s3";
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
    const { publicKey, privateKey } = generateKeyPair(2048);
    const s3KeyErrorHandling = `${job.data.jobName}/${job.data.failedJobId}.json`;
    const s3KeyPrivateKey = `${job.data.jobName}/${job.data.failedJobId}.pem`;

    // Encrypt the data
    const encryptedData = crypto.publicEncrypt(
      publicKey,
      Buffer.from(JSON.stringify(job.data)),
    );

    await Promise.all([
      uploadToS3("failed-job-data", s3KeyErrorHandling, encryptedData),
      uploadToS3("private-key", s3KeyPrivateKey, privateKey),
    ]);

    await db.insert(failedJobs).values({
      jobId: job.data.failedJobId,
      jobName: job.data.jobName,
      s3Key: s3KeyErrorHandling,
    });

    return true;
  },
  { connection },
);

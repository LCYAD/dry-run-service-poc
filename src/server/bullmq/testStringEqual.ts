import { Queue, Worker, type Job } from "bullmq";
import { connection } from "./ioredis";

const queueName = "test-string-equal";

export const testStringEqualQueue = new Queue(queueName, {
  connection,
});

// directly setting up the worker inside the queue
new Worker(
  queueName,
  async (job: Job) => {
    // TODO: develop the comparison function
    console.log("testEqualWorker", job.name);
    console.log("testEqualWorker", job.data);
    return true;
  },
  { connection },
);

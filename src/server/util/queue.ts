import { QUEUE_NAMES } from "../bullmq/constant";
import { testJsonEqualQueue } from "../bullmq/testJsonEqual";
import { testStringEqualQueue } from "../bullmq/testStringEqual";

export const getBullQueue = (qName: string) => {
  if (qName === QUEUE_NAMES.TEST_STRING_EQUAL) return testStringEqualQueue;
  if (qName === QUEUE_NAMES.TEST_JSON_EQUAL) return testJsonEqualQueue;
  return;
};

import { QUEUE_NAMES } from "../bullmq/constant";
import { testStringEqualQueue } from "../bullmq/testStringEqual";

export const getBullQueue = (qName: string) => {
  if (qName === QUEUE_NAMES.TEST_STRING_EQUAL) return testStringEqualQueue;
  return;
};

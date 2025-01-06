import { handle } from "hono/vercel";
import { jobRouter } from "@/server/api/honoRouters/job";

export const POST = handle(jobRouter);

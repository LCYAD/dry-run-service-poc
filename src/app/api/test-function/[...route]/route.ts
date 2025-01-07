import { handle } from "hono/vercel";
import { testFunctionRouter } from "@/server/api/honoRouters/testFunction";

export const GET = handle(testFunctionRouter);

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { failedJobs } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { deleteS3Object } from "@/server/util/s3";

export const failedJobRouter = createTRPCRouter({
  getFailJobs: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx.session?.user?.email ?? "";
    if (!userEmail) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User email is not found in user session",
      });
    }
    const jobs = await ctx.db.select().from(failedJobs);
    return jobs;
  }),
  deleteJob: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const failedJob = await ctx.db
        .select()
        .from(failedJobs)
        .where(eq(failedJobs.id, input.id));
      if (failedJob.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "could not find failedJob by Id",
        });
      }
      await Promise.all([
        ctx.db.delete(failedJobs).where(eq(failedJobs.id, input.id)),
        deleteS3Object(failedJob[0]?.s3Key as string),
      ]);
    }),
});

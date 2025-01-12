import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { approvals, failedJobs } from "@/server/db/schema";
import { eq, inArray } from "drizzle-orm";
import { deleteS3Object } from "@/server/util/s3";
import { authorizedUsers } from "authorizedUsers";

export const failedJobRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    const userEmail = ctx.session?.user?.email ?? "";
    if (!userEmail) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User email is not found in user session",
      });
    }
    const userAccessibleJobs = authorizedUsers[userEmail]?.accessibleJobs ?? [];
    return ctx.db
      .select({
        id: failedJobs.id,
        jobId: failedJobs.jobId,
        jobName: failedJobs.jobName,
        downloadApproved: failedJobs.downloadApproved,
        createdAt: failedJobs.createdAt,
        updatedAt: failedJobs.updatedAt,
      })
      .from(failedJobs)
      .where(inArray(failedJobs.jobName, userAccessibleJobs));
  }),
  delete: protectedProcedure
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
      await ctx.db.delete(approvals).where(eq(approvals.jobId, input.id));
      await Promise.all([
        ctx.db.delete(failedJobs).where(eq(failedJobs.id, input.id)),
        deleteS3Object(failedJob[0]?.s3Key as string),
      ]);
    }),
});

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { approvals, failedJobs } from "@/server/db/schema";
import { eq, inArray } from "drizzle-orm";
import { deleteS3Object, downloadAndDecryptFromS3 } from "@/server/util/s3";
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
  download: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        file: z.instanceof(Uint8Array),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const failedJob = await ctx.db
        .select()
        .from(failedJobs)
        .where(eq(failedJobs.id, input.id))
        .limit(1);

      if (failedJob.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "could not find failedJob by Id",
        });
      }

      const result = await downloadAndDecryptFromS3(
        "failed-job-data",
        failedJob[0]!.s3Key,
        new TextDecoder().decode(input.file),
      );

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }

      return result.data;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const failedJob = await ctx.db
        .select()
        .from(failedJobs)
        .where(eq(failedJobs.id, input.id))
        .limit(1);
      if (failedJob.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "could not find failedJob by Id",
        });
      }
      await ctx.db.delete(approvals).where(eq(approvals.jobId, input.id));
      await Promise.all([
        ctx.db.delete(failedJobs).where(eq(failedJobs.id, input.id)),
        deleteS3Object("failed-job-data", failedJob[0]!.s3Key),
      ]);
    }),
});

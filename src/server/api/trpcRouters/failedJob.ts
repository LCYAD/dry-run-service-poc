import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { approvals, failedJobs } from "@/server/db/schema";
import { eq, inArray } from "drizzle-orm";
import { deleteS3Object, downloadAndDecryptFromS3 } from "@/server/util/s3";
import { authorizedUsers } from "authorizedUsers";
import { nanoid } from "nanoid";
import { getBullQueue } from "@/server/util/queue";

export const failedJobRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    const userEmail = ctx.session?.user?.email ?? "";
    const userRole = ctx.session?.user?.role ?? "";
    if (!userEmail) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User email is not found in user session",
      });
    }
    const userAccessibleJobs = authorizedUsers[userEmail]?.accessibleJobs ?? [];
    return userRole === "developer"
      ? ctx.db
          .select({
            id: failedJobs.id,
            jobId: failedJobs.jobId,
            jobName: failedJobs.jobName,
            downloadApproved: failedJobs.downloadApproved,
            createdAt: failedJobs.createdAt,
            updatedAt: failedJobs.updatedAt,
          })
          .from(failedJobs)
          .where(inArray(failedJobs.jobName, userAccessibleJobs))
      : ctx.db
          .select({
            id: failedJobs.id,
            jobId: failedJobs.jobId,
            jobName: failedJobs.jobName,
            downloadApproved: failedJobs.downloadApproved,
            createdAt: failedJobs.createdAt,
            updatedAt: failedJobs.updatedAt,
          })
          .from(failedJobs);
  }),
  download: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        pKeyfile: z.instanceof(Uint8Array),
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
        new TextDecoder().decode(input.pKeyfile),
      );

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }

      return result.data;
    }),
  retry: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        pKeyfile: z.instanceof(Uint8Array),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const jobs = await ctx.db
        .select()
        .from(failedJobs)
        .where(eq(failedJobs.id, input.id))
        .limit(1);
      if (jobs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "could not find failedJob by Id",
        });
      }
      const failedJob = jobs[0]!;
      const result = await downloadAndDecryptFromS3(
        "failed-job-data",
        failedJob.s3Key,
        new TextDecoder().decode(input.pKeyfile),
      );

      await ctx.db.delete(approvals).where(eq(approvals.jobId, input.id));
      await Promise.all([
        ctx.db.delete(failedJobs).where(eq(failedJobs.id, input.id)),
        deleteS3Object("failed-job-data", failedJob.s3Key),
      ]);
      const queue = getBullQueue(failedJob.jobName);
      if (!queue) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Cannot find the right queue to inser job!",
        });
      }
      const { input: apiInput, expectedRes = {} } = result.data!;
      const newJobId = `string-equal-${nanoid(10)}`;
      await queue.add(newJobId, {
        input: apiInput,
        expectedRes,
      });
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
      return failedJob[0]!;
    }),
});

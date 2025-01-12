import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import { approvals, failedJobs } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { authorizedUsers } from "authorizedUsers";

export const approvalRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx.session?.user?.email ?? "";
    if (!userEmail) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User email is not found in user session",
      });
    }
    const userRole = authorizedUsers[userEmail]?.role;
    const result = await (userRole === "developer"
      ? ctx.db
          .select({
            id: approvals.id,
            jobId: failedJobs.jobId,
            userEmail: approvals.userEmail,
            status: approvals.status,
            createdAt: approvals.createdAt,
            updatedAt: approvals.updatedAt,
          })
          .from(approvals)
          .leftJoin(failedJobs, eq(approvals.jobId, failedJobs.id))
          .where(eq(approvals.userEmail, userEmail))
      : ctx.db
          .select({
            id: approvals.id,
            jobId: failedJobs.jobId,
            userEmail: approvals.userEmail,
            status: approvals.status,
            createdAt: approvals.createdAt,
            updatedAt: approvals.updatedAt,
          })
          .from(approvals)
          .leftJoin(failedJobs, eq(approvals.jobId, failedJobs.id)));
    return result;
  }),
  create: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const approvalStillPending = await ctx.db
        .select()
        .from(approvals)
        .where(
          and(
            eq(approvals.jobId, input.jobId),
            eq(approvals.status, "pending"),
          ),
        );
      if (approvalStillPending.length !== 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "there is another pending approval for this jobId",
        });
      }
      await ctx.db.insert(approvals).values({
        jobId: input.jobId,
        userEmail: ctx.session.user.email as string,
        status: "pending",
      });
    }),
  updateStatus: protectedProcedure
    .input(
      z.object({ id: z.number(), status: z.enum(["approved", "rejected"]) }),
    )
    .mutation(async ({ ctx, input }) => {
      const approval = await ctx.db
        .select()
        .from(approvals)
        .where(eq(approvals.id, input.id));
      if (approval.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "could not find failedJob by Id",
        });
      }
      if (approval[0]?.status !== "pending") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "status could not be updated",
        });
      }
      const updateFailedJobTableOps =
        input.status === "approved"
          ? [
              ctx.db
                .update(failedJobs)
                .set({ downloadApproved: true })
                .where(eq(failedJobs.id, approval[0].jobId)),
            ]
          : [];
      await Promise.all([
        ...updateFailedJobTableOps,
        ctx.db
          .update(approvals)
          .set({ status: input.status })
          .where(eq(approvals.id, input.id)),
      ]);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const approval = await ctx.db
        .select()
        .from(approvals)
        .where(eq(approvals.id, input.id));
      if (approval.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "could not find failedJob by Id",
        });
      }
      await ctx.db.delete(approvals).where(eq(approvals.id, input.id));
    }),
});

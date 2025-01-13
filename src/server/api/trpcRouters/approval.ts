import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import { approvals, auditLogs, failedJobs } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { authorizedUsers } from "authorizedUsers";

export const approvalRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    const userEmail = ctx.session?.user?.email ?? "";
    if (!userEmail) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User email is not found in user session",
      });
    }

    const userRole = authorizedUsers[userEmail]?.role;

    return userRole === "developer"
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
          .leftJoin(failedJobs, eq(approvals.jobId, failedJobs.id));
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
        )
        .limit(1);
      if (approvalStillPending.length !== 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot create approval: pending approval exist!",
        });
      }

      const userEmail = ctx.session.user.email!;

      await Promise.all([
        ctx.db.insert(approvals).values({
          jobId: input.jobId,
          userEmail: userEmail,
          status: "pending",
        }),
        ctx.db.insert(auditLogs).values({
          jobId: input.jobId,
          event: "Approval Requested",
          performedBy: userEmail,
        }),
      ]);
    }),
  updateStatus: protectedProcedure
    .input(
      z.object({ id: z.number(), status: z.enum(["approved", "rejected"]) }),
    )
    .mutation(async ({ ctx, input }) => {
      const results = await ctx.db
        .select()
        .from(approvals)
        .where(eq(approvals.id, input.id))
        .limit(1);
      if (results.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "could not find failedJob by Id",
        });
      }

      const approval = results[0]!;

      if (approval.status !== "pending") {
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
                .where(eq(failedJobs.id, approval.jobId)),
            ]
          : [];

      await Promise.all([
        ...updateFailedJobTableOps,
        ctx.db
          .update(approvals)
          .set({ status: input.status })
          .where(eq(approvals.id, input.id)),
        ctx.db.insert(auditLogs).values({
          jobId: approval.jobId,
          event:
            input.status === "approved"
              ? "Request approved"
              : "Request rejected",
          performedBy: ctx.session.user.email!,
        }),
      ]);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const approval = await ctx.db
        .select()
        .from(approvals)
        .where(eq(approvals.id, input.id))
        .limit(1);
      if (approval.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "could not find failedJob by Id",
        });
      }

      await ctx.db.delete(approvals).where(eq(approvals.id, input.id));
    }),
});

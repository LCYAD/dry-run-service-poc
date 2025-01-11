import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import { approvals } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { authorizedUsers } from "authorizedUsers";

export const approvalRouter = createTRPCRouter({
  getApprovals: protectedProcedure.query(async ({ ctx }) => {
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
          .select()
          .from(approvals)
          .where(eq(approvals.userEmail, userEmail))
      : ctx.db.select().from(approvals));
    return result;
  }),
  create: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(approvals).values({
        jobId: input.jobId,
        userEmail: ctx.session.user.email as string,
        status: "pending",
      });
    }),
});

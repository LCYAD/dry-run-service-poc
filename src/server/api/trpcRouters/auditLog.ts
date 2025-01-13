import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import { auditLogs } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { authorizedUsers } from "authorizedUsers";

export const auditLogRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    const userEmail = ctx.session?.user?.email ?? "";
    if (!userEmail) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User email is not found in user session",
      });
    }

    const userRole = authorizedUsers[userEmail]?.role;
    if (userRole !== "admin") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User is not authorized to access this resource",
      });
    }

    return ctx.db.select().from(auditLogs);
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const logs = await ctx.db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.id, input.id))
        .limit(1);
      if (logs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "could not find failedJob by Id",
        });
      }
      await ctx.db.delete(auditLogs).where(eq(auditLogs.id, input.id));
    }),
});

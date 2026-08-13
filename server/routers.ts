import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { ADMIN_COOKIE_NAME } from "./adminSession";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { storeRouter } from "./routers/store";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  store: storeRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    localLogin: publicProcedure.input(z.object({ username: z.string().trim().min(3).max(64), password: z.string().min(3).max(160) })).mutation(async ({ input, ctx }) => {
      const localAdmin = await db.verifyLocalAdmin(input.username, input.password);
      if (!localAdmin) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid administrator credentials" });
      const token = await sdk.createSessionToken(localAdmin.user.openId, { name: localAdmin.username });
      ctx.res.cookie(ADMIN_COOKIE_NAME, token, getSessionCookieOptions(ctx.req));
      return { success: true, username: localAdmin.username } as const;
    }),
    adminMe: publicProcedure.query(opts => opts.ctx.adminUser),
    adminLogout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    localProfile: adminProcedure.query(() => db.getLocalAdminProfile()),
    updateLocalCredentials: adminProcedure.input(z.object({ currentPassword: z.string().min(3).max(160), username: z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9._-]+$/), password: z.string().min(8).max(160) })).mutation(async ({ input }) => {
      const updated = await db.updateLocalAdminCredentials(input);
      if (!updated) throw new TRPCError({ code: "BAD_REQUEST", message: "Current password is incorrect" });
      return { success: true } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;

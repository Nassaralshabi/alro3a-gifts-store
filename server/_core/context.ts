import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse } from "cookie";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ADMIN_COOKIE_NAME } from "../adminSession";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  adminUser: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let adminUser: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  try {
    const adminToken = parse(opts.req.headers.cookie || "")[ADMIN_COOKIE_NAME];
    const adminSession = await sdk.verifySession(adminToken);
    if (adminSession) {
      const candidate = await db.getUserByOpenId(adminSession.openId);
      if (candidate?.role === "admin") adminUser = candidate;
    }
  } catch (error) {
    adminUser = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    adminUser,
  };
}

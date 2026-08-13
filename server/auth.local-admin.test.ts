import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyLocalAdmin: vi.fn(async () => ({ user: { id: 91, openId: "local-admin-console", name: "admin", email: null, loginMethod: "local", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, username: "admin" })),
  createSessionToken: vi.fn(async () => "local-session-token"),
}));

vi.mock("./db", () => ({ verifyLocalAdmin: mocks.verifyLocalAdmin, getLocalAdminProfile: vi.fn(), updateLocalAdminCredentials: vi.fn() }));
vi.mock("./_core/sdk", () => ({ sdk: { createSessionToken: mocks.createSessionToken } }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { ADMIN_COOKIE_NAME } from "./adminSession";

describe("auth.localLogin", () => {
  it("issues a separate administrator cookie for valid local credentials", async () => {
    const cookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
    const ctx: TrpcContext = { user: null, adminUser: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { cookie: (name: string, value: string, options: Record<string, unknown>) => cookies.push({ name, value, options }) } as TrpcContext["res"] };
    const result = await appRouter.createCaller(ctx).auth.localLogin({ username: "admin", password: "admin" });
    expect(result).toEqual({ success: true, username: "admin" });
    expect(mocks.verifyLocalAdmin).toHaveBeenCalledWith("admin", "admin");
    expect(cookies[0]).toMatchObject({ name: ADMIN_COOKIE_NAME, value: "local-session-token", options: { httpOnly: true, secure: true } });
  });
});

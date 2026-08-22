import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function anonymousContext(): TrpcContext {
  return {
    user: null,
    adminUser: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("store.admin", () => {
  it("rejects dashboard data when no administrator session is present", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.store.admin.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

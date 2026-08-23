import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("لوحة الإدارة الموسعة", () => {
  it("تعرض مركز عمليات مبنياً على بيانات إدارية حية وإجراءات تشغيلية واضحة", () => {
    const admin = source("client/src/pages/Admin.tsx");
    const layout = source("client/src/components/DashboardLayout.tsx");

    expect(admin).toContain("store.admin.operationsOverview.useQuery");
    expect(admin).toContain("مركز العمليات");
    expect(admin).toContain("طلبات تحتاج إجراء");
    expect(admin).toContain("إجراءات سريعة");
    expect(admin).toContain("حالة الطلبات");
    expect(layout).toContain('path: "/admin/appearance"');
  });
});

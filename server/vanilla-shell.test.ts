import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (...parts: string[]) => readFileSync(resolve(process.cwd(), ...parts), "utf8");

describe("واجهة HTML المستقلة", () => {
  it("يحمل المتجر ولوحة الإدارة أصولهما من المسارات المطلقة الصحيحة", () => {
    const storeHtml = projectFile("client", "vanilla", "index.html");
    const adminHtml = projectFile("client", "vanilla", "admin.html");

    expect(storeHtml).toContain('id="app"');
    expect(storeHtml).toContain('href="/vanilla/store.css"');
    expect(storeHtml).toContain('src="/vanilla/store.js"');
    expect(adminHtml).toContain('href="/vanilla/store.css"');
    expect(adminHtml).toContain('href="/vanilla/admin-mobile.css"');
    expect(adminHtml).toContain('src="/vanilla/admin.js"');
    expect(adminHtml).toContain('name="robots" content="noindex,nofollow"');
  });

  it("لا يضع بيانات المدير الافتراضية أو مفاتيح حساسة داخل ملفات الواجهة", () => {
    const publicSource = [
      projectFile("client", "vanilla", "index.html"),
      projectFile("client", "vanilla", "store.js"),
      projectFile("client", "vanilla", "admin.html"),
      projectFile("client", "vanilla", "admin.js"),
      projectFile("client", "vanilla", "api.js"),
    ].join("\n");

    expect(publicSource).not.toContain("admin/admin");
    expect(publicSource).not.toMatch(/JWT_SECRET|DATABASE_URL|BUILT_IN_FORGE_API_KEY/);
  });

  it("يعرّف المسارات الأساسية للواجهة ويعرض حقل الفئة الذي يعيده الخادم", () => {
    const viteSource = projectFile("server", "_core", "vite.ts");
    const adminSource = projectFile("client", "vanilla", "admin.js");
    const storeSource = projectFile("client", "vanilla", "store.js");
    const storeRouterSource = projectFile("server", "routers", "store.ts");

    expect(viteSource).toContain('app.get(["/", "/shop"');
    expect(viteSource).toContain('app.get(["/admin", "/admin/:section"]');
    expect(viteSource).toContain('"/shop"');
    expect(viteSource).toContain('"/contact"');
    expect(viteSource).toContain('"/products/:slug"');
    expect(adminSource).toContain("entry.categoryTitleAr || entry.category?.titleAr");
    expect(storeRouterSource).toContain("priceRange: z.enum");
    expect(storeSource).toContain('id="price-range"');
    expect(storeSource).toContain("function reviewCart(form)");
    expect(storeSource).toContain("data-confirm-order");
  });
});

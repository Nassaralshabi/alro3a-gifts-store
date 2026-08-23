import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const staticRoot = resolve(process.cwd(), "static-html");
const readStaticFile = (name: string) => readFileSync(resolve(staticRoot, name), "utf8");

describe("قوالب حزمة HTML الثابتة", () => {
  it("تحتوي واجهة المتجر على شاشة تحميل محلية تحترم تقليل الحركة", () => {
    const index = readStaticFile("index.html");

    expect(index).toContain('id="boot-loader"');
    expect(index).toContain('src="assets/logo.webp"');
    expect(index).toContain("family=Alexandria");
    expect(index).toContain("family=Marhey");
    expect(index).toContain('prefers-reduced-motion:reduce');
    expect(index).toContain('setAttribute("data-loaded", "true")');
  });

  it("توضح لوحة HTML أن إعداداتها محلية وتعرض شاشة تحميل قبل بيانات الكتالوج", () => {
    const admin = readStaticFile("admin.html");
    const guide = readStaticFile("FULL_STATIC_HTML_INSTALLATION.md");

    expect(admin).toContain('id="boot-loader"');
    expect(admin).toContain("family=Alexandria");
    expect(admin).toContain("LocalStorage");
    expect(guide).toContain("ليست** لوحة إدارة حية أو محمية");
    expect(guide).toContain("262");
  });

  it("تتضمن لوحة HTML الحية إجراءات الإدارة المقيدة عبر جلسة المدير، لا عبر تخزين محلي", () => {
    const liveHtml = readFileSync(resolve(process.cwd(), "client/public/admin-live.html"), "utf8");
    const liveScript = readFileSync(resolve(process.cwd(), "client/public/admin-live.js"), "utf8");

    expect(liveHtml).toContain('name="robots" content="noindex,nofollow"');
    expect(liveHtml).toContain("إدارة حية محمية");
    expect(liveScript).toContain('credentials: "same-origin"');
    expect(liveScript).toContain('"auth.adminMe"');
    expect(liveScript).toContain('"store.admin.saveLiveSettings"');
    expect(liveScript).not.toContain("localStorage");
  });
});

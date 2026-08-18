import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const storefrontFiles = [
  "client/src/pages/Home.tsx",
  "client/src/pages/Shop.tsx",
  "client/src/pages/ProductDetail.tsx",
  "client/src/pages/Contact.tsx",
  "client/src/components/CatalogSections.tsx",
  "client/src/components/StoreShell.tsx",
  "client/src/components/OrderForm.tsx",
  "client/src/components/RequestCartDrawer.tsx",
];

const femininePhrases = [
  "لتبدأي",
  "تسوقي",
  "اختاري",
  "اكتشفي",
  "شاهدي",
  "أضيفي",
  "تصفحي",
  "أرسلي",
  "اجعلي",
  "تحققي",
  "حاولي",
  "أكملي",
  "ابدئي",
  "استكشفي",
  "تواصلي",
  "اكتبي",
];

describe("storefront Arabic copy", () => {
  it("uses general wording instead of feminine-only forms across public shopping flows", () => {
    const copy = storefrontFiles
      .map(file => readFileSync(resolve(process.cwd(), file), "utf8"))
      .join("\n");

    femininePhrases.forEach(phrase => expect(copy).not.toContain(phrase));
  });
});

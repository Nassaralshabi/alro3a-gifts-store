import nodemailer from "nodemailer";

/**
 * Order email notifications — fully env-driven, fails soft.
 * Required env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL
 * Optional: SMTP_SECURE (true/false, default true for port 465)
 * If not configured, notifications are skipped silently (orders still saved).
 */
let cached: nodemailer.Transporter | null | undefined;

function getTransport(): nodemailer.Transporter | null {
  if (cached !== undefined) return cached;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) {
    cached = null;
    return null;
  }
  cached = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: process.env.SMTP_SECURE ?? String(Number(SMTP_PORT) === 465),
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  } as nodemailer.TransportOptions);
  return cached;
}

type OrderMailData = {
  ref: string;
  name: string;
  phone: string;
  notes?: string;
  total?: number | null;
  items: Array<{ title: string; qty: number; price?: number | null }>;
};

/** Fire-and-forget — never throws, never blocks order creation. */
export async function notifyNewOrder(order: OrderMailData): Promise<void> {
  try {
    const transport = getTransport();
    if (!transport) {
      console.info("[notify] SMTP not configured — skipping order email");
      return;
    }
    const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
    const to = process.env.NOTIFY_EMAIL!;

    const lines = order.items
      .map((i) => `• ${i.title} × ${i.qty}${i.price ? ` — ${i.price} د.إ` : ""}`)
      .join("\n");

    const html = `
      <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e4e7e9;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(90deg,#23282d,#333a40);color:#fff;padding:18px 24px">
          <h2 style="margin:0;font-size:18px">🛒 طلب جديد — مطبعة الروعة</h2>
          <p style="margin:6px 0 0;color:#f2bd66;font-weight:bold">رقم الطلب: ${order.ref}</p>
        </div>
        <div style="padding:24px;color:#33393e;font-size:14px;line-height:1.9">
          <p><b>الاسم:</b> ${order.name}</p>
          <p><b>الهاتف:</b> ${order.phone}</p>
          ${order.total ? `<p><b>الإجمالي التقريبي:</b> ${order.total} د.إ</p>` : ""}
          ${order.notes ? `<p><b>تفاصيل:</b> ${order.notes}</p>` : ""}
          <h3 style="font-size:15px;border-top:1px dashed #e4e7e9;padding-top:14px">المنتجات</h3>
          <div style="background:#f7f8f9;border-radius:10px;padding:14px">${lines}</div>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "#"}" style="display:inline-block;margin-top:18px;background:#45505a;color:#fff;text-decoration:none;padding:11px 22px;border-radius:10px;font-weight:bold">فتح لوحة التحكم</a>
        </div>
      </div>`;

    await transport.sendMail({
      from: `"مطبعة الروعة" <${from}>`,
      to,
      subject: `طلب جديد ${order.ref} — ${order.name}`,
      text: `طلب جديد ${order.ref}\nالاسم: ${order.name}\nالهاتف: ${order.phone}\n\n${lines}`,
      html,
    });
    console.info(`[notify] order email sent for ${order.ref}`);
  } catch (err) {
    // never fail the order because of email
    console.error("[notify] order email failed:", (err as Error).message);
  }
}

const fallbackWhatsappUrl = "https://wa.me/971521401021";

export function buildWhatsAppLink(baseUrl: string, message?: string | null) {
  try {
    const url = new URL(baseUrl || fallbackWhatsappUrl);
    const text = message?.trim();
    if (text) url.searchParams.set("text", text);
    return url.toString();
  } catch {
    const url = new URL(fallbackWhatsappUrl);
    if (message?.trim()) url.searchParams.set("text", message.trim());
    return url.toString();
  }
}

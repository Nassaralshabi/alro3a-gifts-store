export async function trpc(path, input, mutation = false) {
  const url = new URL(`/api/trpc/${path}`, window.location.origin);
  const init = { credentials: "include", headers: {} };
  if (mutation) {
    init.method = "POST";
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify({ json: input });
  } else if (input !== undefined) url.searchParams.set("input", JSON.stringify({ json: input }));
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) throw new Error(body.error?.json?.message || body.error?.message || "تعذر إكمال الطلب");
  return body.result?.data?.json;
}

export function esc(value = "") { return String(value).replace(/[&<>'"]/g, character => ({ "&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;" })[character]); }
export function whatsapp(url, message = "") { const endpoint = new URL(url); if (message) endpoint.searchParams.set("text", message); return endpoint.toString(); }

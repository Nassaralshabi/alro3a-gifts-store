const byId = id => document.getElementById(id);
const sessionSummary = byId("session-summary");
const loginView = byId("login-view");
const settingsForm = byId("settings-form");
const logoutButton = byId("logout-button");

function showStatus(id, message, tone = "") {
  const node = byId(id);
  node.textContent = message;
  node.dataset.tone = tone;
}

async function callTrpc(procedure, input, type = "query") {
  const encodedInput = encodeURIComponent(JSON.stringify({ 0: { json: input ?? null } }));
  const response = await fetch(type === "query" ? `/api/trpc/${procedure}?batch=1&input=${encodedInput}` : `/api/trpc/${procedure}?batch=1`, {
    method: type === "query" ? "GET" : "POST",
    credentials: "same-origin",
    headers: type === "query" ? undefined : { "content-type": "application/json" },
    body: type === "query" ? undefined : JSON.stringify({ 0: { json: input } }),
  });
  const body = await response.json().catch(() => null);
  const entry = Array.isArray(body) ? body[0] : null;
  if (!response.ok || entry?.error) throw new Error(entry?.error?.json?.message || "تعذر تنفيذ الطلب بأمان.");
  return entry?.result?.data?.json;
}

function setSignedOut(message = "سجّل الدخول بحساب مدير للوصول إلى الإعدادات الحية.") {
  sessionSummary.textContent = message;
  loginView.classList.remove("hidden");
  settingsForm.classList.add("hidden");
  logoutButton.classList.add("hidden");
}

function fillSettings(settings) {
  byId("contact-phone").value = settings.contact.phone;
  byId("contact-whatsapp").value = settings.contact.whatsapp;
  byId("contact-address").value = settings.contact.addressAr;
  byId("contact-instagram").value = settings.contact.instagram;
  byId("hero-badge").value = settings.hero.badgeAr;
  byId("hero-title").value = settings.hero.titleAr;
  byId("hero-subtitle").value = settings.hero.subtitleAr;
}

async function loadLiveSettings() {
  const [admin, settings] = await Promise.all([callTrpc("auth.adminMe"), callTrpc("store.admin.liveSettings")]);
  sessionSummary.textContent = `جلسة مدير نشطة: ${admin?.name || "مدير"}`;
  loginView.classList.add("hidden");
  settingsForm.classList.remove("hidden");
  logoutButton.classList.remove("hidden");
  fillSettings(settings);
}

async function initialise() {
  try {
    const admin = await callTrpc("auth.adminMe");
    if (!admin) return setSignedOut();
    await loadLiveSettings();
  } catch {
    setSignedOut("تعذر التحقق من الجلسة. سجّل الدخول من جديد.");
  }
}

byId("login-form").addEventListener("submit", async event => {
  event.preventDefault();
  const button = byId("login-button");
  button.disabled = true;
  showStatus("login-status", "يتم التحقق من بيانات المدير…");
  try {
    await callTrpc("auth.localLogin", { username: byId("login-username").value.trim(), password: byId("login-password").value }, "mutation");
    byId("login-password").value = "";
    await loadLiveSettings();
  } catch {
    showStatus("login-status", "تعذر الدخول. تحقق من بيانات المدير ثم أعد المحاولة.", "error");
  } finally {
    button.disabled = false;
  }
});

settingsForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = byId("save-button");
  button.disabled = true;
  showStatus("settings-status", "يتم حفظ التغييرات الحية…");
  try {
    await callTrpc("store.admin.saveLiveSettings", {
      contact: { phone: byId("contact-phone").value.trim(), whatsapp: byId("contact-whatsapp").value.trim(), addressAr: byId("contact-address").value.trim(), instagram: byId("contact-instagram").value.trim().replace(/^@/, "") },
      hero: { badgeAr: byId("hero-badge").value.trim(), titleAr: byId("hero-title").value.trim(), subtitleAr: byId("hero-subtitle").value.trim() },
    }, "mutation");
    showStatus("settings-status", "تم حفظ التغييرات الحية بنجاح.", "success");
  } catch {
    showStatus("settings-status", "تعذر الحفظ. تحقّق من الجلسة والحقول ثم أعد المحاولة.", "error");
  } finally {
    button.disabled = false;
  }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  try { await callTrpc("auth.adminLogout", null, "mutation"); } finally { logoutButton.disabled = false; setSignedOut("تم تسجيل الخروج من الإدارة الحية."); }
});

initialise();

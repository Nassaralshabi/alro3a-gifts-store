import { esc, trpc, whatsapp } from "./api.js";

const app = document.querySelector("#app");
const state = { categories: [], products: [], contact: null, home: null, cart: JSON.parse(localStorage.getItem("alrawaa-html-cart") || "[]"), language: localStorage.getItem("alrawaa-html-language") || "ar", category: "", query: "", priceOrder: "default", priceRange: "all", currentProduct: null, nextCursor: null, totalProducts: 0 };
const copy = (ar, en) => state.language === "ar" ? ar : en;
const title = entry => copy(entry.titleAr, entry.titleEn);
const price = value => value ? `${Number(value).toLocaleString(state.language === "ar" ? "ar-AE" : "en-AE")} AED` : copy("السعر حسب التفاصيل المطلوبة", "Price on request");
const saveCart = () => localStorage.setItem("alrawaa-html-cart", JSON.stringify(state.cart));

function defaultMessage() { return state.language === "ar" ? state.contact.whatsappDefaultMessageAr : state.contact.whatsappDefaultMessageEn; }
function showToast(message) { const element = document.createElement("div"); element.className = "toast"; element.textContent = message; document.body.append(element); setTimeout(() => element.remove(), 3200); }
function heroImage() { return state.home?.heroImages?.[0] || "/manus-storage/hero-graduation-uae_bc00c190.jpg"; }

function card(entry) {
  const product = entry.product || entry;
  return `<article class="card"><button data-product="${esc(product.slug)}"><img loading="lazy" src="${esc(product.imageUrl || "/manus-storage/social-2_de273aa2.jpg")}" alt="${esc(title(product))}"><div class="card-copy"><span class="badge">${esc(copy("قابل للتخصيص", "Customisable"))}</span><h3>${esc(title(product))}</h3><span class="price">${esc(price(product.price))}</span></div></button></article>`;
}

function renderShell(content) {
  const contact = state.contact;
  const whatsappHref = whatsapp(contact.whatsappUrl, defaultMessage());
  const nav = state.categories.map(category => `<button class="${state.category === category.slug ? "active" : ""}" data-category="${esc(category.slug)}">${esc(title(category))}</button>`).join("");
  app.innerHTML = `<div class="shell" dir="${state.language === "ar" ? "rtl" : "ltr"}"><div class="topbar"><div class="container"><span>${esc(state.language === "ar" ? contact.addressAr : contact.addressEn)}</span><span><a href="${esc(whatsappHref)}" target="_blank" rel="noreferrer">${esc(contact.phone)} · WhatsApp</a></span></div></div><header class="header"><div class="container nav"><a class="brand" href="/"><img src="/manus-storage/alrawhaa-logo_cfae3a03.webp" alt="Al Rawaa"><span>${esc(copy("مطبعة الروعة", "Al Rawaa Printing"))}<small>${esc(copy("هدايا بطابعك", "GIFTS, YOUR WAY"))}</small></span></a><div class="actions"><button class="icon-button" data-language aria-label="Language">${state.language === "ar" ? "EN" : "ع"}</button><a class="button secondary" href="/admin">${esc(copy("لوحة التحكم", "Admin"))}</a><button class="button" data-cart>${esc(copy("سلة الطلب", "Request cart"))} <span>(${state.cart.reduce((sum, item) => sum + item.quantity, 0)})</span></button></div></div><div class="container catalog-nav"><button class="${!state.category ? "active" : ""}" data-category="">${esc(copy("كل المنتجات", "All products"))}</button>${nav}</div></header><main>${content}</main><footer class="footer"><div class="container"><strong>${esc(copy("مطبعة الروعة", "Al Rawaa Printing"))}</strong><p>${esc(copy("هدايا ومطبوعات حسب الطلب في عجمان وتوصيل لكل الإمارات.", "Made-to-order printing and gifts in Ajman, delivered across the UAE."))}</p><a href="${esc(whatsappHref)}" target="_blank" rel="noreferrer">${esc(copy("تواصل عبر واتساب", "Contact on WhatsApp"))}</a></div></footer></div><div class="modal" id="product-modal"></div><div class="drawer" id="cart-drawer"></div>`;
}

function renderHome() {
  const featured = state.products.filter(entry => (entry.product || entry).isFeatured).slice(0, 8);
  renderShell(`<section class="hero"><div class="hero-copy"><span class="eyebrow">${esc(copy("تفاصيل تُصنع خصيصًا لك", "MADE FOR YOUR DETAILS"))}</span><h1>${esc(copy("هديتك تبدأ بتفصيلة لا تُنسى", "A gift begins with an unforgettable detail"))}</h1><p>${esc(copy("تصفح التصاميم، أضف ما يناسبك إلى السلة، ثم أرسل التفاصيل مباشرة للمطبعة عبر واتساب.", "Browse designs, add what you need to the cart, then send your details directly on WhatsApp."))}</p><div class="actions"><button class="button gold" data-shop>${esc(copy("تصفح المنتجات", "Browse products"))}</button><a class="button secondary" href="${esc(whatsapp(state.contact.whatsappUrl, defaultMessage()))}" target="_blank" rel="noreferrer">${esc(copy("طلب مخصص", "Custom request"))}</a></div></div><img class="hero-img" src="${esc(heroImage())}" alt="${esc(copy("هدايا ومطبوعات مطبعة الروعة", "Al Rawaa gifts and printing"))}"></section><div class="container features"><div class="feature"><strong>${esc(copy("توصيل لكل الإمارات", "UAE delivery"))}</strong><span>${esc(copy("نجهز طلبك بعناية", "Prepared with care"))}</span></div><div class="feature"><strong>${esc(copy("تصاميم حسب الطلب", "Made to order"))}</strong><span>${esc(copy("تفاصيل تناسب مناسبتك", "Details for your occasion"))}</span></div><div class="feature"><strong>${esc(copy("تأكيد سريع", "Quick confirmation"))}</strong><span>${esc(copy("عبر واتساب", "Through WhatsApp"))}</span></div></div><section class="section container"><div class="section-head"><div><span class="eyebrow">${esc(copy("مختارات الروعة", "AL RAWAA PICKS"))}</span><h2>${esc(copy("منتجات جاهزة للتخصيص", "Products ready to customise"))}</h2></div><button class="button secondary" data-shop>${esc(copy("عرض الكل", "View all"))}</button></div><div class="grid">${featured.map(card).join("") || `<div class="empty">${esc(copy("يجري تحميل المنتجات…", "Loading products…"))}</div>`}</div></section>`);
}

function renderContact() {
  const contact = state.contact;
  const instagram = contact.instagram ? `https://www.instagram.com/${encodeURIComponent(contact.instagram)}/` : "#";
  renderShell(`<section class="section container"><div class="admin-panel" dir="${state.language === "ar" ? "rtl" : "ltr"}"><span class="eyebrow">${esc(copy("تواصل معنا", "CONTACT US"))}</span><h1>${esc(copy("نساعدك في تجهيز هديتك", "Let's prepare your gift"))}</h1><p>${esc(copy("أرسل تفاصيل المقاس والكمية والمناسبة، وسيؤكد فريق مطبعة الروعة خيارات التنفيذ معك عبر واتساب.", "Share the size, quantity and occasion and the Al Rawaa team will confirm production options with you on WhatsApp."))}</p><div class="actions"><a class="button" href="${esc(whatsapp(contact.whatsappUrl, defaultMessage()))}" target="_blank" rel="noreferrer">${esc(copy("تواصل عبر واتساب", "Message on WhatsApp"))}</a><a class="button secondary" href="tel:${esc(contact.phone.replace(/[^0-9+]/g, ""))}">${esc(contact.phone)}</a><a class="button secondary" href="${esc(instagram)}" target="_blank" rel="noreferrer">Instagram</a></div><p>${esc(state.language === "ar" ? contact.addressAr : contact.addressEn)}</p></div></section>`);
}

async function loadProducts(append = false) {
  const input = { categorySlug: state.category || undefined, query: state.query || undefined, priceOrder: state.priceOrder, priceRange: state.priceRange, cursor: append ? state.nextCursor ?? undefined : 0, limit: 24 };
  const response = await trpc("store.catalog.productsPage", input);
  state.products = append ? [...state.products, ...(response.items || [])] : (response.items || []);
  state.nextCursor = response.nextCursor ?? null;
  state.totalProducts = response.total ?? state.products.length;
}

async function renderShop(append = false) {
  await loadProducts(append);
  const categoryName = state.categories.find(category => category.slug === state.category);
  const resultsLabel = copy(`عرض ${state.products.length} من ${state.totalProducts} منتج`, `Showing ${state.products.length} of ${state.totalProducts} products`);
  const more = state.nextCursor === null ? "" : `<div class="section"><button class="button secondary" data-load-more>${esc(copy("تحميل المزيد", "Load more"))}</button></div>`;
  renderShell(`<section class="section container"><div class="section-head"><div><span class="eyebrow">${esc(copy("الكتالوج", "CATALOG"))}</span><h1>${esc(categoryName ? title(categoryName) : copy("كل المنتجات", "All products"))}</h1><p>${esc(copy("ابحث، صفِّ النتائج، وأضف المنتجات إلى سلة الطلب.", "Search, filter and add products to your request cart."))}</p><p class="price" aria-live="polite">${esc(resultsLabel)}</p></div></div><div class="toolbar"><input class="input" id="search" value="${esc(state.query)}" placeholder="${esc(copy("ابحث عن هدية أو مطبوعة…", "Search gifts or printing…"))}"><select class="select" id="price-range" aria-label="${esc(copy("نطاق السعر", "Price range"))}"><option value="all">${esc(copy("كل الأسعار", "All prices"))}</option><option value="under-75" ${state.priceRange === "under-75" ? "selected" : ""}>${esc(copy("حتى 75 د.إ", "Up to AED 75"))}</option><option value="75-150" ${state.priceRange === "75-150" ? "selected" : ""}>${esc(copy("من 75 إلى 150 د.إ", "AED 75–150"))}</option><option value="over-150" ${state.priceRange === "over-150" ? "selected" : ""}>${esc(copy("أكثر من 150 د.إ", "Over AED 150"))}</option><option value="on-request" ${state.priceRange === "on-request" ? "selected" : ""}>${esc(copy("السعر حسب الطلب", "Price on request"))}</option></select><select class="select" id="order"><option value="default">${esc(copy("الترتيب الافتراضي", "Default order"))}</option><option value="asc" ${state.priceOrder === "asc" ? "selected" : ""}>${esc(copy("السعر من الأقل", "Price: low first"))}</option><option value="desc" ${state.priceOrder === "desc" ? "selected" : ""}>${esc(copy("السعر من الأعلى", "Price: high first"))}</option></select></div><div class="grid">${state.products.map(card).join("") || `<div class="empty">${esc(copy("لا توجد منتجات مطابقة. جرّب كلمة بحث أو فئة مختلفة.", "No matching products. Try another search or category."))}</div>`}</div>${more}</section>`);
}

async function openProduct(slug) {
  const result = await trpc("store.catalog.productBySlug", { slug });
  const product = result.product || result;
  state.currentProduct = product;
  const modal = document.querySelector("#product-modal");
  modal.innerHTML = `<div class="modal-box" dir="${state.language === "ar" ? "rtl" : "ltr"}"><button class="icon-button" data-close-modal>×</button><div class="product-detail"><img src="${esc(product.imageUrl || "")}" alt="${esc(title(product))}"><div><span class="eyebrow">${esc(copy("منتج قابل للتخصيص", "CUSTOMISABLE PRODUCT"))}</span><h1>${esc(title(product))}</h1><p class="price">${esc(price(product.price))}</p><p>${esc(copy(product.descriptionAr || "شارك تفاصيل المقاس والكمية والمناسبة، وسنجهز الطلب.", product.descriptionEn || "Share the size, quantity and occasion and we will prepare your request."))}</p><button class="button" data-add="${esc(product.id)}">${esc(copy("إضافة إلى سلة الطلب", "Add to request cart"))}</button></div></div></div>`;
  modal.classList.add("open");
}

function renderCart() {
  const drawer = document.querySelector("#cart-drawer");
  const lines = state.cart.map(item => `<div class="cart-line"><img src="${esc(item.imageUrl || "")}" alt=""><div><b>${esc(title(item))}</b><br><small>${esc(price(item.price))}</small></div><div class="count"><button data-minus="${item.id}">−</button><span>${item.quantity}</span><button data-plus="${item.id}">+</button></div></div>`).join("");
  drawer.innerHTML = `<aside class="drawer-box" dir="${state.language === "ar" ? "rtl" : "ltr"}"><div class="section-head"><h2>${esc(copy("سلة الطلب", "Request cart"))}</h2><button class="icon-button" data-close-cart>×</button></div>${lines || `<div class="empty">${esc(copy("السلة فارغة حاليًا.", "Your cart is empty."))}</div>`}${state.cart.length ? `<form id="checkout"><input class="input" required name="name" placeholder="${esc(copy("الاسم", "Name"))}"><input class="input" required name="phone" placeholder="${esc(copy("رقم الهاتف", "Phone number"))}"><textarea class="textarea" name="notes" placeholder="${esc(copy("تفاصيل الطلب أو المناسبة", "Occasion or request details"))}"></textarea><button class="button" type="submit">${esc(copy("مراجعة الطلب", "Review request"))}</button></form>` : ""}</aside>`;
  drawer.classList.add("open");
}

function reviewCart(form) {
  if (!form.reportValidity()) return;
  const customerName = form.name.value.trim(); const customerPhone = form.phone.value.trim(); const notes = form.notes.value.trim();
  const items = state.cart.map(item => `<div class="cart-line"><img src="${esc(item.imageUrl || "")}" alt=""><div><b>${esc(title(item))}</b><br><small>${esc(price(item.price))} · ${esc(copy("الكمية", "Qty"))}: ${item.quantity}</small></div></div>`).join("");
  const modal = document.querySelector("#product-modal");
  modal.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="review-title" dir="${state.language === "ar" ? "rtl" : "ltr"}"><button class="icon-button" data-close-modal aria-label="${esc(copy("إغلاق", "Close"))}">×</button><span class="eyebrow">${esc(copy("مراجعة قبل الإرسال", "REVIEW BEFORE SENDING"))}</span><h1 id="review-title">${esc(copy("ملخص طلبك", "Your request summary"))}</h1><div class="admin-panel"><p><b>${esc(copy("الاسم", "Name"))}:</b> ${esc(customerName)}</p><p><b>${esc(copy("الهاتف", "Phone"))}:</b> ${esc(customerPhone)}</p><p><b>${esc(copy("التفاصيل", "Details"))}:</b> ${esc(notes || "—")}</p></div><div>${items}</div><p class="price">${esc(copy(`عدد المنتجات: ${state.cart.length} · إجمالي القطع: ${state.cart.reduce((sum, item) => sum + item.quantity, 0)}`, `Products: ${state.cart.length} · Total items: ${state.cart.reduce((sum, item) => sum + item.quantity, 0)}`))}</p><p>${esc(copy("سيُحفظ الطلب أولًا، ثم تُفتح رسالة واتساب بالتفاصيل نفسها.", "The request will be saved first, then WhatsApp will open with the same details."))}</p><button class="button" data-confirm-order>${esc(copy("تأكيد وحفظ الطلب ثم فتح واتساب", "Confirm, save and open WhatsApp"))}</button></div>`;
  modal.classList.add("open");
}

async function submitCart(form) {
  const customerName = form.name.value.trim(); const customerPhone = form.phone.value.trim(); const notes = form.notes.value.trim();
  const orders = await Promise.all(state.cart.map(item => trpc("store.orders.create", { productId: item.id, customerName, customerPhone, quantity: item.quantity, notes: notes || null, language: state.language }, true)));
  const productLines = state.cart.map(item => `• ${title(item)} × ${item.quantity}`).join("\n");
  const message = state.language === "ar" ? `مرحباً مطبعة الروعة، أرسلت طلبًا جديدًا (${orders.map(order => `#${order.id}`).join("، ")})\nالاسم: ${customerName}\nالهاتف: ${customerPhone}\n${productLines}\nالتفاصيل: ${notes || "—"}` : `Hello Al Rawaa Printing, I sent a new request (${orders.map(order => `#${order.id}`).join(", ")})\nName: ${customerName}\nPhone: ${customerPhone}\n${productLines}\nNotes: ${notes || "—"}`;
  window.open(whatsapp(state.contact.whatsappUrl, message), "_blank", "noopener,noreferrer");
  state.cart = []; saveCart(); document.querySelector("#cart-drawer").classList.remove("open"); showToast(copy("تم حفظ الطلب وفتح واتساب.", "Request saved and WhatsApp opened."));
}

function addProduct(id) { const product = state.currentProduct; if (!product || Number(product.id) !== Number(id)) return; const item = state.cart.find(entry => entry.id === product.id); if (item) item.quantity += 1; else state.cart.push({ ...product, quantity: 1 }); saveCart(); document.querySelector("#product-modal").classList.remove("open"); showToast(copy("تمت إضافة المنتج إلى السلة.", "Product added to cart.")); renderHome(); }

document.addEventListener("click", async event => {
  const target = event.target.closest("[data-product],[data-category],[data-shop],[data-cart],[data-language],[data-close-modal],[data-close-cart],[data-add],[data-plus],[data-minus],[data-load-more],[data-confirm-order]"); if (!target) return;
  if (target.dataset.product) return openProduct(target.dataset.product);
  if (target.dataset.category !== undefined) { state.category = target.dataset.category; state.query = ""; return renderShop(); }
  if (target.hasAttribute("data-shop")) return renderShop();
  if (target.hasAttribute("data-load-more")) return renderShop(true);
  if (target.hasAttribute("data-cart")) return renderCart();
  if (target.hasAttribute("data-confirm-order")) { const form = document.querySelector("#checkout"); if (form) return submitCart(form).catch(error => showToast(error.message)); }
  if (target.hasAttribute("data-language")) { state.language = state.language === "ar" ? "en" : "ar"; localStorage.setItem("alrawaa-html-language", state.language); return renderHome(); }
  if (target.hasAttribute("data-close-modal")) return document.querySelector("#product-modal").classList.remove("open");
  if (target.hasAttribute("data-close-cart")) return document.querySelector("#cart-drawer").classList.remove("open");
  if (target.dataset.add) return addProduct(target.dataset.add);
  const item = state.cart.find(entry => String(entry.id) === (target.dataset.plus || target.dataset.minus)); if (!item) return; item.quantity += target.dataset.plus ? 1 : -1; if (item.quantity < 1) state.cart = state.cart.filter(entry => entry !== item); saveCart(); renderCart();
});

document.addEventListener("change", event => { if (event.target.id === "order") { state.priceOrder = event.target.value; renderShop(); } if (event.target.id === "price-range") { state.priceRange = event.target.value; renderShop(); } });
document.addEventListener("keydown", event => { if (event.target.id === "search" && event.key === "Enter") { state.query = event.target.value.trim(); renderShop(); } });
document.addEventListener("submit", event => { if (event.target.id === "checkout") { event.preventDefault(); reviewCart(event.target); } });

async function init() {
  try { const [contact, categories, home] = await Promise.all([trpc("store.catalog.contact"), trpc("store.catalog.categories"), trpc("store.catalog.homeContent")]); state.contact = contact; state.categories = categories; state.home = home; await loadProducts(); const productMatch = /^\/products\/([^/]+)$/.exec(location.pathname); const serviceMatch = /^\/services\/([^/]+)$/.exec(location.pathname); if (productMatch) { renderHome(); openProduct(productMatch[1]); } else if (serviceMatch) { state.category = serviceMatch[1]; renderShop(); } else if (location.pathname === "/shop") renderShop(); else if (location.pathname === "/contact") renderContact(); else renderHome(); } catch (error) { app.innerHTML = `<div class="container section"><div class="empty">${esc(error.message || "تعذر تحميل المتجر")}</div></div>`; }
}
init();

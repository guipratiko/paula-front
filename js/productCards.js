const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80";

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeImageUrl(url) {
  const u = String(url ?? "").trim();
  if (u.startsWith("https://") || u.startsWith("http://")) return u;
  return PLACEHOLDER_IMG;
}

function productWhatsAppHref(p) {
  const wa = typeof window.pffWhatsAppLink === "function" ? window.pffWhatsAppLink : null;
  if (!wa) return "#contato";
  const skuPart = p.sku ? ` — ref.: ${p.sku}` : "";
  const msg = `Olá! Sou lojista/revendedor e tenho interesse na peça "${p.name}" (${p.category})${skuPart} no atacado da Paula Fashion Fitness.`;
  return wa(msg);
}

export function renderProductCard(p) {
  const img = safeImageUrl(p.image_url);
  const rawDesc = String(p.description ?? "").trim();
  const short = rawDesc.length > 160 ? `${rawDesc.slice(0, 160)}…` : rawDesc;
  const desc = short
    ? escapeHtml(short)
    : "Consulte condições de atacado e disponibilidade com nossa equipe.";
  const skuHtml = p.sku
    ? `<p class="card-catalog__sku">Ref. ${escapeHtml(p.sku)}</p>`
    : "";
  const href = productWhatsAppHref(p);

  return `
    <article class="card-catalog catalog-product-card">
      <div class="card-catalog__media">
        <img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" width="800" height="1067" loading="lazy" />
      </div>
      <div class="card-catalog__body">
        <p class="section-kicker" style="margin:0 0 0.35rem;font-size:0.65rem">${escapeHtml(p.category)}</p>
        <h3 class="card-catalog__title">${escapeHtml(p.name)}</h3>
        ${skuHtml}
        <p class="card-catalog__desc">${desc}</p>
        <a class="btn btn--outline" href="${escapeHtml(href)}" rel="noopener noreferrer">Consultar atacado</a>
      </div>
    </article>
  `;
}

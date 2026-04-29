import { apiUrl } from "./apiBase.js";
import { wireWhatsAppLinks } from "./whatsappLinks.js";

/** Imagens genéricas só para composição visual; o conteúdo real é o nome da categoria (Bling). */
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1594381898411-30e38d7f43d9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518310383802-640c2de31168?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1434682881908-43f303d0fca5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e53078660f?auto=format&fit=crop&w=800&q=80",
];

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pickPlaceholderImage(name) {
  return PLACEHOLDER_IMAGES[hashString(name) % PLACEHOLDER_IMAGES.length];
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

/**
 * Preenche a grade da seção Coleção com categorias vindas da API (Bling / Mongo).
 */
export async function initCollectionCategories() {
  const root = document.getElementById("collection-categories-root");
  const emptyEl = document.getElementById("collection-categories-empty");
  if (!root) return;

  let names = [];
  try {
    const res = await fetch(apiUrl("/api/categories"), { headers: { Accept: "application/json" } });
    if (res.ok) {
      const data = await res.json();
      names = Array.isArray(data?.categories)
        ? data.categories.map((x) => String(x ?? "").trim()).filter(Boolean)
        : [];
    }
  } catch {
    /* ignore */
  }

  if (names.length === 0) {
    root.innerHTML = "";
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;

  root.innerHTML = names
    .map((name) => {
      const img = pickPlaceholderImage(name);
      const esc = escapeHtml(name);
      const q = encodeURIComponent(name);
      return `<article class="card-catalog" data-reveal>
      <div class="card-catalog__media">
        <img src="${escapeHtml(img)}" alt="${esc}" width="800" height="1067" loading="lazy" />
      </div>
      <div class="card-catalog__body">
        <h3 class="card-catalog__title">${esc}</h3>
        <p class="card-catalog__desc">Linha no atacado para lojistas. Consulte disponibilidade e grade no WhatsApp.</p>
        <div class="card-catalog__actions">
          <a class="btn btn--primary" href="/categoria/?c=${q}">Ver categoria</a>
          <a class="btn btn--outline btn--sm" data-whatsapp="category" data-whatsapp-extra="${esc}" href="#">WhatsApp</a>
        </div>
      </div>
    </article>`;
    })
    .join("");

  wireWhatsAppLinks(root);

  if (typeof window.__pffFlushReveal === "function") {
    requestAnimationFrame(() => window.__pffFlushReveal());
  }
}

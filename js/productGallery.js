import { escapeHtml, getProductWhatsAppHref } from "./productCards.js";
import { wireWhatsAppLinks } from "./whatsappLinks.js";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80";

function galleryUrlsFromProduct(p) {
  const raw = Array.isArray(p?.image_urls) ? p.image_urls : [];
  const list = raw.map((u) => String(u ?? "").trim()).filter((u) => u.startsWith("http"));
  const main = String(p?.image_url ?? "").trim();
  const merged = [...new Set([...list, main].filter((u) => u.startsWith("http")))];
  return merged.length > 0 ? merged : [PLACEHOLDER_IMG];
}

/**
 * @param {HTMLElement} gridRoot
 * @param {() => Array<Record<string, unknown>>} getProducts
 */
export function wireProductGallery(gridRoot, getProducts) {
  if (!gridRoot || typeof getProducts !== "function") return;

  const dialog = document.getElementById("product-gallery-dialog");
  if (!dialog || !("showModal" in dialog)) return;

  if (gridRoot.dataset.productGalleryWired === "1") return;
  gridRoot.dataset.productGalleryWired = "1";

  const mainImg = dialog.querySelector("[data-gallery-main]");
  const track = dialog.querySelector("[data-gallery-thumbs]");
  const titleEl = dialog.querySelector("[data-gallery-title]");
  const catEl = dialog.querySelector("[data-gallery-category]");
  const descEl = dialog.querySelector("[data-gallery-desc]");
  const waBtn = dialog.querySelector("[data-gallery-wa]");
  const btnPrev = dialog.querySelector("[data-gallery-prev]");
  const btnNext = dialog.querySelector("[data-gallery-next]");
  const btnClose = dialog.querySelector("[data-gallery-close]");

  let urls = [];
  let index = 0;
  /** @type {Element | null} */
  let restoreFocus = null;

  function showIndex(i) {
    if (urls.length === 0) return;
    index = ((i % urls.length) + urls.length) % urls.length;
    if (mainImg) {
      mainImg.src = urls[index];
      mainImg.alt = `Foto ${index + 1} de ${urls.length}`;
    }
    if (track) {
      track.querySelectorAll("[data-gallery-thumb]").forEach((btn, j) => {
        btn.classList.toggle("is-active", j === index);
        btn.setAttribute("aria-selected", j === index ? "true" : "false");
      });
      const active = track.querySelector(`[data-gallery-thumb][data-index="${index}"]`);
      active?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
    if (btnPrev) btnPrev.disabled = urls.length < 2;
    if (btnNext) btnNext.disabled = urls.length < 2;
  }

  function onKey(ev) {
    if (!dialog.open) return;
    if (ev.key === "ArrowLeft") {
      ev.preventDefault();
      showIndex(index - 1);
    } else if (ev.key === "ArrowRight") {
      ev.preventDefault();
      showIndex(index + 1);
    }
  }

  function open(p) {
    urls = galleryUrlsFromProduct(p);
    index = 0;
    if (titleEl) titleEl.textContent = String(p.name ?? "");
    if (catEl) catEl.textContent = String(p.category ?? "");
    const fullDesc = String(p.description ?? "").trim();
    if (descEl) {
      descEl.textContent = fullDesc
        ? fullDesc
        : "Consulte condições de atacado e disponibilidade com nossa equipe.";
    }
    if (waBtn) {
      waBtn.setAttribute("href", getProductWhatsAppHref(p));
    }
    if (track) {
      track.innerHTML = urls
        .map(
          (u, j) =>
            `<button type="button" class="product-gallery__thumb" data-gallery-thumb data-index="${j}" role="tab" aria-selected="${j === 0}" aria-label="Foto ${j + 1}">
              <img src="${escapeHtml(u)}" alt="" loading="lazy" width="120" height="160" />
            </button>`
        )
        .join("");
      track.querySelectorAll("[data-gallery-thumb]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const j = Number(btn.getAttribute("data-index"));
          if (Number.isFinite(j)) showIndex(j);
        });
      });
    }
    showIndex(0);
    wireWhatsAppLinks(dialog);
    restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    requestAnimationFrame(() => btnClose?.focus());
    document.addEventListener("keydown", onKey);
  }

  function close() {
    document.removeEventListener("keydown", onKey);
    dialog.close();
    if (restoreFocus instanceof HTMLElement) restoreFocus.focus();
  }

  btnClose?.addEventListener("click", () => close());
  btnPrev?.addEventListener("click", () => showIndex(index - 1));
  btnNext?.addEventListener("click", () => showIndex(index + 1));

  dialog.addEventListener("click", (ev) => {
    if (ev.target === dialog) close();
  });

  dialog.addEventListener("close", () => {
    document.removeEventListener("keydown", onKey);
  });

  gridRoot.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".card-catalog__media-btn");
    if (!btn || !gridRoot.contains(btn)) return;
    const article = btn.closest("[data-product-id]");
    const id = article?.getAttribute("data-product-id")?.trim();
    if (!id) return;
    const products = getProducts();
    const p = products.find((x) => String(x.id ?? "") === id);
    if (p) {
      ev.preventDefault();
      open(p);
    }
  });
}

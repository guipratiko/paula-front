import { apiUrl } from "./apiBase.js";
import { fetchCategories } from "./categories.js";
import { renderProductCard } from "./productCards.js";
import { wireWhatsAppLinks } from "./whatsappLinks.js";

/** @type {Array<Record<string, unknown>>} */
let allProducts = [];
let filterCategory = "";
let searchQuery = "";
let debounceTimer = null;

function norm(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function productMatchesSearch(p, q) {
  const raw = String(q ?? "").trim();
  if (!raw) return true;
  const n = norm(raw);
  const hay = norm([p.name, p.category, p.sku, p.description].filter(Boolean).join(" "));
  return hay.includes(n) || n.split(/\s+/).filter(Boolean).every((token) => hay.includes(token));
}

function productMatchesCategory(p, cat) {
  if (!cat) return true;
  return String(p.category ?? "").trim() === cat;
}

function getFiltered() {
  return allProducts.filter(
    (p) => productMatchesCategory(p, filterCategory) && productMatchesSearch(p, searchQuery.trim())
  );
}

function renderProductGrid(root, products) {
  root.innerHTML = products.map(renderProductCard).join("");
  wireWhatsAppLinks(root);
}

function updateMeta(metaEl, filtered, total) {
  if (!metaEl) return;
  if (total === 0) {
    metaEl.textContent = "";
    return;
  }
  if (filtered.length === total) {
    metaEl.textContent = `${total} peça${total === 1 ? "" : "s"}`;
  } else {
    metaEl.textContent = `${filtered.length} de ${total} peça${total === 1 ? "" : "s"}`;
  }
}

function syncChipsActive(container) {
  if (!container) return;
  container.querySelectorAll("[data-catalog-cat]").forEach((btn) => {
    const v = btn.getAttribute("data-catalog-cat") ?? "";
    const active = v === filterCategory;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function buildCategoryChips(container, categories) {
  if (!container) return;
  const frag = document.createDocumentFragment();
  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "catalog-chip is-active";
  allBtn.setAttribute("data-catalog-cat", "");
  allBtn.setAttribute("aria-pressed", "true");
  allBtn.textContent = "Todas";
  frag.appendChild(allBtn);

  for (const raw of categories) {
    const name = String(raw ?? "").trim();
    if (!name) continue;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "catalog-chip";
    btn.setAttribute("data-catalog-cat", name);
    btn.setAttribute("aria-pressed", "false");
    btn.textContent = name;
    frag.appendChild(btn);
  }
  container.innerHTML = "";
  container.appendChild(frag);
}

function applyFiltersAndRender() {
  const wrap = document.getElementById("catalog-dynamic-wrap");
  const root = document.getElementById("catalog-products-root");
  const empty = document.getElementById("catalog-empty-state");
  const meta = document.getElementById("catalog-results-meta");
  const chips = document.getElementById("catalog-filter-chips");
  const clearBtn = document.getElementById("catalog-search-clear");
  const input = document.getElementById("catalog-search-input");

  if (!root || !wrap) return;

  const filtered = getFiltered();
  const total = allProducts.length;

  if (input && clearBtn) {
    clearBtn.hidden = !input.value.trim();
  }

  updateMeta(meta, filtered, total);
  syncChipsActive(chips);

  if (filtered.length === 0) {
    root.innerHTML = "";
    if (empty) empty.hidden = false;
  } else {
    if (empty) empty.hidden = true;
    renderProductGrid(root, filtered);
  }
}

function debouncedApply() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => applyFiltersAndRender(), 180);
}

function wireToolbar() {
  const input = document.getElementById("catalog-search-input");
  const clearBtn = document.getElementById("catalog-search-clear");
  const chips = document.getElementById("catalog-filter-chips");
  const reset = document.getElementById("catalog-reset-filters");

  input?.addEventListener("input", () => {
    searchQuery = input.value;
    debouncedApply();
  });

  clearBtn?.addEventListener("click", () => {
    if (input) input.value = "";
    searchQuery = "";
    applyFiltersAndRender();
    input?.focus();
  });

  chips?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-catalog-cat]");
    if (!btn) return;
    filterCategory = btn.getAttribute("data-catalog-cat") ?? "";
    applyFiltersAndRender();
  });

  reset?.addEventListener("click", () => {
    filterCategory = "";
    searchQuery = "";
    if (input) input.value = "";
    applyFiltersAndRender();
    input?.focus();
  });

  document.querySelectorAll("[data-catalog-suggest]").forEach((b) => {
    b.addEventListener("click", () => {
      const term = b.getAttribute("data-catalog-suggest") ?? "";
      if (input) input.value = term;
      searchQuery = term;
      applyFiltersAndRender();
      input?.focus();
    });
  });
}

function wireHeaderSearch() {
  const form = document.getElementById("header-catalog-search");
  const headerInput = document.getElementById("header-search-input");
  const mainInput = document.getElementById("catalog-search-input");
  if (!form || !headerInput || !mainInput) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    mainInput.value = headerInput.value;
    searchQuery = headerInput.value;
    applyFiltersAndRender();
    document.getElementById("colecao")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => mainInput.focus(), 400);
  });
}

/**
 * Carrega produtos ativos, barra de busca / filtros (estilo vitrine) e aplica filtro no cliente.
 */
export async function initCatalog() {
  const wrap = document.getElementById("catalog-dynamic-wrap");
  const root = document.getElementById("catalog-products-root");
  const toolbar = document.getElementById("catalog-toolbar");
  const chipsRoot = document.getElementById("catalog-filter-chips");
  if (!wrap || !root) return;

  const [categories, data] = await Promise.all([
    fetchCategories(),
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/products"), { headers: { Accept: "application/json" } });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    })(),
  ]);

  const products = Array.isArray(data?.products) ? data.products : [];
  allProducts = products;

  if (products.length === 0) {
    wrap.hidden = true;
    root.innerHTML = "";
    if (toolbar) toolbar.hidden = true;
    return;
  }

  wrap.hidden = false;
  if (toolbar) {
    toolbar.hidden = false;
    buildCategoryChips(chipsRoot, categories);
  }

  filterCategory = "";
  searchQuery = "";
  const input = document.getElementById("catalog-search-input");
  if (input) input.value = "";

  wireToolbar();
  wireHeaderSearch();
  applyFiltersAndRender();
}

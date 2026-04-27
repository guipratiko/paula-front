import { apiUrl } from "./apiBase.js";
import { renderProductCard } from "./productCards.js";

/**
 * Carrega produtos ativos da API e exibe na seção Coleção (#colecao).
 */
export async function initCatalog() {
  const wrap = document.getElementById("catalog-dynamic-wrap");
  const root = document.getElementById("catalog-products-root");
  if (!wrap || !root) return;

  let data;
  try {
    const res = await fetch(apiUrl("/api/products"), { headers: { Accept: "application/json" } });
    if (!res.ok) return;
    data = await res.json();
  } catch {
    return;
  }

  const products = Array.isArray(data.products) ? data.products : [];
  if (products.length === 0) {
    wrap.hidden = true;
    root.innerHTML = "";
    return;
  }

  wrap.hidden = false;
  root.innerHTML = products.map(renderProductCard).join("");
}

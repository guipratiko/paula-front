import { apiUrl } from "./apiBase.js";

let cachedCategories = null;

export function clearCategoriesCache() {
  cachedCategories = null;
}

/**
 * Categorias públicas (Bling + produtos ativos). Sem lista fixa no front.
 */
export async function fetchCategories() {
  if (Array.isArray(cachedCategories)) {
    return cachedCategories;
  }

  try {
    const res = await fetch(apiUrl("/api/categories"), { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("fetch");
    const data = await res.json();
    const apiCategories = Array.isArray(data?.categories)
      ? data.categories.map((item) => String(item ?? "").trim()).filter(Boolean)
      : [];
    cachedCategories = apiCategories;
    return apiCategories;
  } catch {
    cachedCategories = [];
    return [];
  }
}

export async function isValidCategory(name) {
  const categoryName = String(name ?? "").trim();
  if (!categoryName) return false;
  const categories = await fetchCategories();
  return categories.includes(categoryName);
}

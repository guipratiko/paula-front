import { apiUrl } from "./apiBase.js";

/** Mesmas categorias do painel e da API (ordem = vitrine do site). */
export const PRODUCT_CATEGORIES = [
  "Leggings",
  "Tops",
  "Conjuntos Fitness",
  "Shorts",
  "Macacões",
  "Croppeds",
  "Jaquetas Fitness",
  "Outros",
];

let cachedCategories = null;

export async function fetchCategories() {
  if (Array.isArray(cachedCategories) && cachedCategories.length > 0) {
    return cachedCategories;
  }

  try {
    const res = await fetch(apiUrl("/api/categories"), { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("fetch");
    const data = await res.json();
    const apiCategories = Array.isArray(data?.categories)
      ? data.categories.map((item) => String(item ?? "").trim()).filter(Boolean)
      : [];
    if (apiCategories.length > 0) {
      cachedCategories = apiCategories;
      return apiCategories;
    }
  } catch {
    // fallback para lista local quando a API não estiver disponível
  }

  cachedCategories = PRODUCT_CATEGORIES;
  return PRODUCT_CATEGORIES;
}

export async function isValidCategory(name) {
  const categoryName = String(name ?? "").trim();
  if (!categoryName) return false;
  const categories = await fetchCategories();
  return categories.includes(categoryName);
}

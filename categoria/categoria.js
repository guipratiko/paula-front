import "../js/config.js";
import { apiUrl } from "../js/apiBase.js";
import { wireWhatsAppLinks } from "../js/whatsappLinks.js";
import { renderProductCard } from "../js/productCards.js";
import { fetchCategories, isValidCategory } from "../js/categories.js";

const params = new URLSearchParams(window.location.search);
const category = params.get("c")?.trim() ?? "";

const alertEl = document.getElementById("categoria-alert");
const headEl = document.getElementById("categoria-head");
const titleEl = document.getElementById("categoria-title");
const gridEl = document.getElementById("categoria-grid");
const emptyEl = document.getElementById("categoria-empty");
const emptyWa = document.getElementById("categoria-empty-wa");

function setupNav() {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  const navLinks = document.querySelectorAll(".site-nav a");

  function closeNav() {
    navToggle?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }

  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    nav?.classList.toggle("is-open", !open);
    document.body.classList.toggle("nav-open", !open);
  });

  navLinks.forEach((a) => a.addEventListener("click", () => closeNav()));

  window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  });
}

async function run() {
  setupNav();
  wireWhatsAppLinks(document);

  const categories = await fetchCategories();
  if (!category || !(await isValidCategory(category))) {
    alertEl.hidden = false;
    alertEl.textContent =
      `Categoria não encontrada. Categorias disponíveis: ${categories.join(", ")}.`;
    document.title = "Categoria — Paula Fashion Fitness";
    return;
  }

  document.title = `${category} no atacado — Paula Fashion Fitness`;
  titleEl.textContent = category;
  headEl.hidden = false;
  emptyWa.setAttribute("data-whatsapp-extra", category);
  wireWhatsAppLinks(document);

  let data;
  try {
    const q = new URLSearchParams({ category });
    const res = await fetch(apiUrl(`/api/products?${q}`), { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("fetch");
    data = await res.json();
  } catch {
    alertEl.hidden = false;
    alertEl.textContent =
      "Não foi possível carregar os produtos. Verifique se o servidor está ativo e tente de novo.";
    return;
  }

  const products = Array.isArray(data.products) ? data.products : [];

  if (products.length === 0) {
    gridEl.hidden = true;
    emptyEl.hidden = false;
    wireWhatsAppLinks(document);
    return;
  }

  gridEl.hidden = false;
  emptyEl.hidden = true;
  gridEl.innerHTML = products.map(renderProductCard).join("");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => void run());
} else {
  void run();
}

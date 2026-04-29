import { loadSiteConfigFromApi } from "./config.js";
import { initSiteFooter } from "./siteFooter.js";
import { wireWhatsAppLinks } from "./whatsappLinks.js";

function setupLegalNav() {
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

async function boot() {
  setupLegalNav();
  await loadSiteConfigFromApi();
  initSiteFooter();
  wireWhatsAppLinks(document);
}

void boot();

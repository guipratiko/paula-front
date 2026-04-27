import "./config.js";
import { initCatalog } from "./catalog.js";
import { wireWhatsAppLinks } from "./whatsappLinks.js";

function initFooterFromConfig() {
  const cfg = window.PFF_CONFIG;
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  if (!cfg) return;
  const ig = document.getElementById("link-instagram");
  if (ig && cfg.instagram) ig.href = cfg.instagram;
  const em = document.getElementById("link-email");
  if (em && cfg.email) em.href = `mailto:${cfg.email}`;
  const ad = document.getElementById("footer-address");
  if (ad && cfg.address) ad.textContent = cfg.address;
}

(function () {
  async function onReady() {
    wireWhatsAppLinks(document);
    initFooterFromConfig();
    await initCatalog();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      void onReady();
    });
  } else {
    void onReady();
  }

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

  navLinks.forEach((a) => {
    a.addEventListener("click", () => closeNav());
  });

  window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  });

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReduced.matches) return;

  const revealEls = document.querySelectorAll("[data-reveal]");
  if (!revealEls.length || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  revealEls.forEach((el) => io.observe(el));
})();

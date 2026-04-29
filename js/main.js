import "./config.js";
import { initCollectionCategories } from "./collectionCategories.js";
import { initCatalog } from "./catalog.js";
import { wireWhatsAppLinks } from "./whatsappLinks.js";

const HERO_POSTER =
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80";

function setupHeroVideo() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const heroVideo = document.querySelector(".hero__video");
  const heroMedia = document.querySelector(".hero__media");
  if (!heroVideo || !heroMedia) return;

  const useFallback = () => {
    heroMedia.classList.add("hero__media--fallback");
  };

  heroVideo.addEventListener("error", useFallback, { once: true });
  heroVideo.addEventListener(
    "loadeddata",
    () => {
      heroMedia.classList.remove("hero__media--fallback");
    },
    { once: true }
  );

  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  heroVideo.playsInline = true;
  heroVideo.setAttribute("playsinline", "");
  if (!heroVideo.getAttribute("poster")) {
    heroVideo.setAttribute("poster", HERO_POSTER);
  }

  const tryPlay = () => {
    const p = heroVideo.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        if (heroVideo.error) useFallback();
        const resume = () => {
          void heroVideo.play().catch(() => {});
          document.removeEventListener("pointerdown", resume, true);
          document.removeEventListener("keydown", resume, true);
        };
        document.addEventListener("pointerdown", resume, true);
        document.addEventListener("keydown", resume, true);
      });
    }
  };

  if (heroVideo.readyState >= 1) {
    tryPlay();
  } else {
    heroVideo.addEventListener("loadedmetadata", tryPlay, { once: true });
    heroVideo.addEventListener("canplay", tryPlay, { once: true });
    tryPlay();
  }
}

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
    setupHeroVideo();
    await initCollectionCategories();
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

  const revealEls = document.querySelectorAll("[data-reveal]");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  /* Sem animação: conteúdo precisa ficar visível ([data-reveal] começa com opacity: 0 no CSS). */
  if (prefersReduced.matches) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  if (!revealEls.length || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  /* Hero já na primeira dobra: não depender só do primeiro tick do observer no Chrome. */
  document.querySelectorAll(".hero [data-reveal]").forEach((el) => el.classList.add("is-visible"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    /* threshold alto + rootMargin negativo falhava em alguns viewports / zoom. */
    { rootMargin: "0px 0px 12% 0px", threshold: 0.01 }
  );

  const startObserve = () => {
    revealEls.forEach((el) => {
      if (!el.classList.contains("is-visible")) io.observe(el);
    });
  };
  requestAnimationFrame(() => requestAnimationFrame(startObserve));
})();

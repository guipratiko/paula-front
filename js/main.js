import { loadSiteConfigFromApi } from "./config.js";
import { initCollectionCategories } from "./collectionCategories.js";
import { initCatalog } from "./catalog.js";
import { wireWhatsAppLinks } from "./whatsappLinks.js";

function setupHeroVideo() {
  const heroVideo = document.querySelector(".hero__video");
  const heroMedia = document.querySelector(".hero__media");
  if (!heroVideo || !heroMedia) return;

  const useFallback = () => {
    heroMedia.classList.add("hero__media--fallback");
  };

  heroVideo.addEventListener(
    "error",
    () => {
      setTimeout(() => {
        if (!heroVideo.error) return;
        const code = heroVideo.error.code;
        const fatal =
          heroVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE ||
          code === 2 ||
          code === 4;
        if (fatal) useFallback();
      }, 400);
    },
    { once: true }
  );

  /* Autoplay no Chrome: muted + playsInline + atributos explícitos */
  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  heroVideo.playsInline = true;
  heroVideo.loop = true;
  heroVideo.setAttribute("muted", "");
  heroVideo.setAttribute("playsinline", "");
  heroVideo.setAttribute("webkit-playsinline", "");
  if (!heroVideo.getAttribute("src")) {
    heroVideo.src = "/img/banner.mp4";
  }

  const tryPlay = () => {
    if (heroMedia.classList.contains("hero__media--fallback")) return;
    const p = heroVideo.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
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

  heroMedia.classList.remove("hero__media--fallback");

  const onMediaReady = () => {
    heroVideo.removeAttribute("poster");
    tryPlay();
  };

  heroVideo.addEventListener("loadeddata", onMediaReady, { once: true });
  heroVideo.addEventListener("canplay", onMediaReady, { once: true });
  heroVideo.addEventListener("canplaythrough", tryPlay, { once: true });
  heroVideo.addEventListener("playing", () => heroVideo.removeAttribute("poster"), { once: true });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") tryPlay();
  });

  window.addEventListener("pageshow", (ev) => {
    if (ev.persisted) tryPlay();
  });

  let tries = 0;
  const kick = setInterval(() => {
    tries += 1;
    if (heroVideo.playing || tries > 25) {
      clearInterval(kick);
      return;
    }
    tryPlay();
  }, 200);

  tryPlay();
}

/**
 * Reveal no scroll: mais previsível que só IntersectionObserver (Chrome / zoom / primeira pintura).
 */
function createRevealScrollController() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReduced.matches) {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
    return () => {};
  }

  let scheduled = false;
  const flush = () => {
    scheduled = false;
    const h = window.innerHeight || 0;
    const pad = Math.max(24, Math.min(100, h * 0.06));
    document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < h - pad && r.bottom > pad) {
        el.classList.add("is-visible");
      }
    });
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(flush);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("load", schedule);
  schedule();
  requestAnimationFrame(() => requestAnimationFrame(schedule));

  return flush;
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
  let revealFlush = () => {};

  async function onReady() {
    await loadSiteConfigFromApi();
    wireWhatsAppLinks(document);
    initFooterFromConfig();
    await initCollectionCategories();
    await initCatalog();
    revealFlush();
  }

  function boot() {
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

    revealFlush = createRevealScrollController();
    window.__pffFlushReveal = revealFlush;

    setupHeroVideo();

    void onReady()
      .then(() => revealFlush())
      .catch(() => revealFlush());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();

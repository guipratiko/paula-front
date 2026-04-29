import { normalizeWhatsappForWaMe } from "./config.js";

/** Dígitos para tel:+… (mesma lógica BR que wa.me). */
function phoneDigitsBr(raw) {
  return normalizeWhatsappForWaMe(raw);
}

export function telHrefFromDisplay(raw) {
  const d = phoneDigitsBr(raw);
  return d ? `tel:+${d}` : "#";
}

/** Preenche rodapé a partir de `window.PFF_CONFIG` (API ou defaults). */
export function initSiteFooter() {
  const cfg = window.PFF_CONFIG;
  if (!cfg) return;

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const brandLine = document.getElementById("footer-brand-line");
  if (brandLine) {
    const b = String(cfg.siteBrandLine ?? "").trim();
    brandLine.textContent = b || "Paula Fashion | Fitness";
  }

  const legalEl = document.getElementById("footer-legal-line");
  if (legalEl) {
    const leg = String(cfg.legalLine ?? "").trim();
    if (leg) {
      legalEl.textContent = leg;
      legalEl.hidden = false;
    } else {
      legalEl.textContent = "";
      legalEl.hidden = true;
    }
  }

  const ad = document.getElementById("footer-address");
  if (ad && cfg.address != null) {
    ad.textContent = String(cfg.address).trim();
  }

  const ig = document.getElementById("link-instagram");
  if (ig && cfg.instagram) ig.href = cfg.instagram;

  const fb = document.getElementById("link-facebook");
  if (fb) {
    const fu = String(cfg.facebookUrl ?? "").trim();
    if (fu) {
      fb.href = fu;
      fb.hidden = false;
    } else {
      fb.hidden = true;
    }
  }

  const em = document.getElementById("link-email");
  if (em && cfg.email) em.href = `mailto:${cfg.email}`;

  const ph = document.getElementById("link-phone");
  if (ph) {
    if (cfg.phoneLandline && String(cfg.phoneLandline).trim()) {
      ph.textContent = String(cfg.phoneLandline).trim();
      ph.href = telHrefFromDisplay(cfg.phoneLandline);
      ph.hidden = false;
    } else {
      ph.hidden = true;
    }
  }
}

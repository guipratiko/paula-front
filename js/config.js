import { apiUrl } from "./apiBase.js";

/**
 * Paula Fashion Fitness — configuração comercial (defaults offline).
 * Em runtime, `loadSiteConfigFromApi()` sobrepõe com GET /api/site-config do backend.
 */
export const PFF_CONFIG = {
  whatsappNumber: "5511999999999",
  siteBrandLine: "Paula Fashion | Fitness",
  legalLine: "",
  phoneLandline: "",
  facebookUrl: "https://www.facebook.com/paulafitness/",
  whatsappMessages: {
    default:
      "Olá! Sou lojista/revendedor e gostaria de consultar condições de atacado na Paula Fashion Fitness.",
    atacado:
      "Olá! Quero comprar no atacado e conhecer a coleção fitness feminina da Paula Fashion Fitness.",
    category:
      "Olá! Sou lojista e quero consultar atacado da categoria: ",
  },
  instagram: "https://www.instagram.com/",
  email: "contato@paulafashionfitness.com.br",
  address: "São Paulo — SP, Brasil",
};

/** wa.me: só dígitos; Brasil sem 55 → prefixa 55 (ex.: (62) 3210-1112 → 556232101112). */
export function normalizeWhatsappForWaMe(raw) {
  const d = String(raw ?? "").replace(/\D/g, "");
  if (!d) return "5511999999999";
  if (d.startsWith("55") && d.length >= 12) return d;
  if (d.length >= 10 && d.length <= 11) return `55${d}`;
  return d;
}

/** Mescla resposta de `/api/site-config` em `window.PFF_CONFIG` (mesma referência que `PFF_CONFIG`). */
export async function loadSiteConfigFromApi() {
  try {
    const res = await fetch(apiUrl("/api/site-config"), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = await res.json();
    const cfg = window.PFF_CONFIG;
    if (!data || !cfg) return;

    if (data.whatsappNumber != null && String(data.whatsappNumber).trim() !== "") {
      cfg.whatsappNumber = normalizeWhatsappForWaMe(data.whatsappNumber);
    }
    if (data.instagram) cfg.instagram = String(data.instagram).trim();
    if (data.email) cfg.email = String(data.email).trim();
    if (data.address != null) cfg.address = String(data.address).trim();
    if (data.siteBrandLine != null && String(data.siteBrandLine).trim() !== "") {
      cfg.siteBrandLine = String(data.siteBrandLine).trim();
    }
    if (data.legalLine != null) cfg.legalLine = String(data.legalLine).trim();
    if (data.phoneLandline != null) cfg.phoneLandline = String(data.phoneLandline).trim();
    if (data.facebookUrl != null && String(data.facebookUrl).trim() !== "") {
      cfg.facebookUrl = String(data.facebookUrl).trim();
    }

    const wm = data.whatsappMessages;
    if (wm && typeof wm === "object") {
      if (wm.default) cfg.whatsappMessages.default = wm.default;
      if (wm.atacado) cfg.whatsappMessages.atacado = wm.atacado;
      if (wm.category) cfg.whatsappMessages.category = wm.category;
    }
  } catch {
    /* API indisponível: mantém defaults */
  }
}

export function pffWhatsAppLink(message) {
  const text = encodeURIComponent(message || PFF_CONFIG.whatsappMessages.default);
  return `https://wa.me/${PFF_CONFIG.whatsappNumber}?text=${text}`;
}

window.PFF_CONFIG = PFF_CONFIG;
window.pffWhatsAppLink = pffWhatsAppLink;

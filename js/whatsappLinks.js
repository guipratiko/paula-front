export function wireWhatsAppLinks(root = document) {
  const cfg = window.PFF_CONFIG;
  if (!cfg || typeof window.pffWhatsAppLink !== "function") return;
  root.querySelectorAll("[data-whatsapp]").forEach((el) => {
    const key = el.getAttribute("data-whatsapp");
    const extra = el.getAttribute("data-whatsapp-extra") || "";
    let msg = cfg.whatsappMessages.default;
    if (key && cfg.whatsappMessages[key]) {
      msg = cfg.whatsappMessages[key];
    }
    if (key === "category" && extra) {
      msg = cfg.whatsappMessages.category + extra;
    }
    el.setAttribute("href", window.pffWhatsAppLink(msg));
    if (el.tagName === "A") el.setAttribute("rel", "noopener noreferrer");
  });
}

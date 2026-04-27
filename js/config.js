/**
 * Paula Fashion Fitness — configuração comercial
 * Ajuste número e mensagens antes de publicar.
 */
export const PFF_CONFIG = {
  whatsappNumber: "5511999999999", // DDD + número, sem símbolos
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

export function pffWhatsAppLink(message) {
  const text = encodeURIComponent(message || PFF_CONFIG.whatsappMessages.default);
  return `https://wa.me/${PFF_CONFIG.whatsappNumber}?text=${text}`;
}

window.PFF_CONFIG = PFF_CONFIG;
window.pffWhatsAppLink = pffWhatsAppLink;

import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Evita 404: navegadores pedem /favicon.ico por padrão. */
function faviconIcoRedirect() {
  const handler = (req, res, next) => {
    const u = req.url ?? "";
    if (u === "/favicon.ico" || u.startsWith("/favicon.ico?")) {
      res.statusCode = 302;
      res.setHeader("Location", "/favicon.svg");
      res.end();
      return;
    }
    next();
  };
  return {
    name: "favicon-ico-redirect",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  root: ".",
  publicDir: "public",
  plugins: [faviconIcoRedirect()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        admin: path.resolve(__dirname, "admin/index.html"),
        categoria: path.resolve(__dirname, "categoria/index.html"),
      },
    },
  },
  server: {
    port: 5173,
    allowedHosts: ["scancal.com.br", "www.scancal.com.br", "localhost", "127.0.0.1"],
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: ["scancal.com.br", "www.scancal.com.br", "localhost", "127.0.0.1"],
  },
});

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { createCorsMiddleware } from "./cors";
import { clearLegacySessionCookie } from "./cookies";
import { loadOneDriveWorkbook } from "../onedrive";

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(createCorsMiddleware());
  app.use(clearLegacySessionCookie());

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.post("/api/onedrive/load", async (req, res) => {
    const sourceUrl = typeof req.body?.url === "string" ? req.body.url.trim() : "";
    if (!sourceUrl) {
      res.status(400).json({ error: "Pega un enlace compartido de OneDrive o SharePoint." });
      return;
    }
    try {
      const payload = await loadOneDriveWorkbook(sourceUrl);
      res.json(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo leer el archivo compartido.";
      res.status(422).json({ error: message });
    }
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const port = parseInt(process.env.PORT || "3000");
  server.listen(port, () => {
    console.log("[api] server listening");
  });
}

startServer().catch(() => {
  console.error("[api] server failed to start");
});

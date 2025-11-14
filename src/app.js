// src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

// Routers
import userRouter from "./routers/user.router.js";
import turnoRouter from "./routers/turno.router.js";
import carritoRouter from "./routers/carrito.router.js";
import saludMentalRouter from "./routers/saludMental.router.js";
import marketingRouter from "./routers/marketing.router.js";
import adminRouter from "./routers/admin.router.js";
import staffUserRouter from "./routers/staffUser.router.js";
import asesoramientoRoutes from "./routers/asesoramiento.router.js";
import usuarioAutorizadoRouter from "./routers/usuarioAutorizado.router.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------ ENV ------------------------
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const IS_PROD = process.env.NODE_ENV === "production";

// Normalizamos origen (por si viene con / final)
const normalizeOrigin = (url) => url.replace(/\/$/, "");
const ALLOWED_ORIGINS = [
  normalizeOrigin(FRONTEND_URL),
  normalizeOrigin("http://localhost:3000"),
];

// ------------------------ TRUST PROXY ------------------------
app.set("trust proxy", 1);

// ------------------------ SEGURIDAD ------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // para Sockets e imágenes externas
  })
);

app.use(compression());

// ------------------------ LOGS ------------------------
app.use(morgan(IS_PROD ? "combined" : "dev"));

// ------------------------ RATE LIMIT ------------------------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ------------------------ CORS ------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      // Safari / Postman / servidores internos → origin null
      if (!origin) return callback(null, true);

      const clean = normalizeOrigin(origin);

      if (ALLOWED_ORIGINS.includes(clean)) return callback(null, true);

      console.warn("⛔ Origen bloqueado por CORS:", clean);
      return callback(new Error("CORS blocked"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ------------------------ BODY PARSERS ------------------------
app.use(
  express.json({
    limit: "1mb",
    verify: (req, res, buf) => {
      // Permite manejar JSON inválido
      req.rawBody = buf.toString();
    },
  })
);

app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Protección contra JSON inválido
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ message: "JSON malformado" });
  }
  next();
});

// ------------------------ STATIC FILES ------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// ------------------------ HEALTHCHECK ------------------------
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

// ------------------------ API ROUTES ------------------------
app.use("/api/user", userRouter);
app.use("/api/staff", staffUserRouter);
app.use("/api/admin", adminRouter);
app.use("/api/turnos", turnoRouter);
app.use("/api/carrito", carritoRouter);
app.use("/api/salud-mental", saludMentalRouter);
app.use("/api/marketing", marketingRouter);
app.use("/api/asesoramiento", asesoramientoRoutes);
app.use("/api/usuario-autorizado", usuarioAutorizadoRouter);

// ------------------------ 404 HANDLER ------------------------
app.use((req, res) => {
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(404).json({ error: "API: Ruta no encontrada" });
  }
  res.status(404).send("404 Not Found");
});

// ------------------------ ERROR GLOBAL ------------------------
app.use((err, _req, res, _next) => {
  console.error("💥 Error no controlado:", err.message || err);

  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
  });
});

export default app;

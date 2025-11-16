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

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const IS_PROD = process.env.NODE_ENV === "production";

// -------------------- TRUST PROXY --------------------
app.set("trust proxy", 1);

// ====================================================================
// ======================  C O R S   P R I M E R O  ===================
// ====================================================================
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://app-medicina-front.vercel.app",
  FRONTEND_URL.replace(/\/$/, ""),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const clean = origin.replace(/\/$/, "");
      if (ALLOWED_ORIGINS.includes(clean)) return callback(null, true);
      console.warn("⛔ CORS bloqueado:", clean);
      return callback(new Error("CORS blocked"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight OPTIONS
app.options("*", cors());
// ====================================================================


// -------------------- SECURITY (DESPUÉS DE CORS) --------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

app.use(compression());

// -------------------- LOGGING (DESPUÉS DE CORS) --------------------
app.use(morgan(IS_PROD ? "combined" : "dev"));

// -------------------- RATE LIMIT (DESPUÉS DE CORS) --------------------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// -------------------- BODY PARSERS --------------------
app.use(
  express.json({
    limit: "1mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// -------------------- STATIC FILES --------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// -------------------- HEALTHCHECK --------------------
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

// -------------------- ROUTES --------------------
app.use("/api/user", userRouter);
app.use("/api/staff", staffUserRouter);
app.use("/api/admin", adminRouter);
app.use("/api/turnos", turnoRouter);
app.use("/api/carrito", carritoRouter);
app.use("/api/salud-mental", saludMentalRouter);
app.use("/api/marketing", marketingRouter);
app.use("/api/asesoramiento", asesoramientoRoutes);
app.use("/api/usuarios-autorizados", usuarioAutorizadoRouter);

// -------------------- 404 --------------------
app.use((req, res) => {
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(404).json({ error: "API: Ruta no encontrada" });
  }
  res.status(404).send("404 Not Found");
});

// -------------------- GLOBAL ERROR --------------------
app.use((err, _req, res, _next) => {
  console.error("💥 Error no controlado:", err.message || err);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
  });
});

export default app;

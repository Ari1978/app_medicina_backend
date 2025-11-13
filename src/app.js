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

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const IS_PROD = process.env.NODE_ENV === "production";

// -------- Trust proxy (p/ cookies secure detrás de proxy: vercel/nginx/heroku)
app.set("trust proxy", 1);

// -------- Seguridad y performance
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // p/ servir imágenes públicas
}));
app.use(compression());

// -------- Logs (dev)
app.use(morgan(IS_PROD ? "combined" : "dev"));

// -------- Rate limit (anti brute force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// -------- CORS
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));

// -------- Parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// -------- Estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// -------- Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development", time: new Date().toISOString() });
});

// -------- Rutas API
app.use("/api/user", userRouter);
app.use("/api/staff", staffUserRouter);
app.use("/api/admin", adminRouter);
app.use("/api/turnos", turnoRouter);
app.use("/api/carrito", carritoRouter);
app.use("/api/salud-mental", saludMentalRouter);
app.use("/api/marketing", marketingRouter);
app.use("/api/asesoramiento", asesoramientoRoutes);
app.use("/api/usuario-autorizado", usuarioAutorizadoRouter);


// -------- 404 handler
app.use((req, res) => {
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(404).json({ error: "API: Ruta no encontrada" });
  }
  res.status(404).send("404 Not Found");
});

// -------- Error handler global (JSON consistente)
app.use((err, _req, res, _next) => {
  console.error("💥 Error no controlado:", err);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
  });
});

export default app;

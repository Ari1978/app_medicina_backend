// src/routers/vistas.router.js
import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { authRequired, adminMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// -----------------------
// INDEX - HTML estático
// -----------------------
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// -----------------------
// HOME - Handlebars
// -----------------------
router.get("/home", (req, res) => {
  res.render("home", {
    title: "Home Asmel"
    // user y year ya vienen de res.locals en app.js
  });
});

// -----------------------
// Empresa - usuario logueado
// -----------------------
router.get("/empresa/home", authRequired, (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect("/"); // seguridad adicional

  if (user.role === "empresa" || user.role === "admin") {
    return res.render("empresaHome", { title: "Inicio Empresa", user });
  }

  return res.status(403).render("errors/403", { title: "Acceso denegado", message: "No tienes permisos" });
});

// -----------------------
// Admin - rutas protegidas
// -----------------------
router.get("/admin/dashboard", authRequired, adminMiddleware, (req, res) => {
  res.render("adminDashboard", { title: "Dashboard Admin", user: req.session.user });
});

router.get("/admin", authRequired, adminMiddleware, (req, res) => {
  res.render("admin/adminPanel", { title: "Panel Admin", user: req.session.user });
});

// -----------------------
// Perfil usuario
// -----------------------
router.get("/profile", authRequired, (req, res) => {
  res.render("users/profile", { title: "Perfil", user: req.session.user });
});

export default router;

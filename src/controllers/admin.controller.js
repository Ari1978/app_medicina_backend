// src/controllers/admin.controller.js
import { AdminService } from "../services/admin.service.js";
import csv from "csv-parser";
import fs from "fs";
import {
  clearAllAuthCookies,
  setAuthCookie,
  COOKIE_ADMIN,
  generateTokenForAdmin,
} from "../utils/jwt.js";

import { UserRepository } from "../repositories/user.repository.js";
import { adminResponseDTO } from "../dto/admin.dto.js";
import { staffResponseDTO } from "../dto/staff.dto.js";
import { userResponseDTO } from "../dto/user.dto.js";

export const AdminController = {
  /* =========================================================
     🔐 LOGIN ADMIN / SUPERADMIN
  ========================================================= */
  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password)
        return res
          .status(400)
          .json({ message: "Usuario y contraseña requeridos" });

      const admin = await AdminService.login(username.trim(), password);

      clearAllAuthCookies(res);

      const token = generateTokenForAdmin(admin);
      setAuthCookie(res, COOKIE_ADMIN, token);

      return res.json({
        message: "Login exitoso",
        user: adminResponseDTO(admin),
        token,
      });
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }
  },

  /* =========================================================
     🛠️ CREAR ADMIN / STAFF / EMPRESA
  ========================================================= */
  async crearAdmin(req, res) {
    try {
      if (!req.user?.superadmin)
        return res.status(403).json({ message: "Solo SuperAdmin" });

      const { username, password, nombre, apellido, superadmin } = req.body;

      if (!username || !password || !nombre || !apellido)
        return res.status(400).json({ message: "Faltan campos" });

      const nuevo = await AdminService.crearAdmin(
        { username, password, nombre, apellido, superadmin },
        req.user
      );

      return res.status(201).json({
        message: "Admin creado",
        admin: adminResponseDTO(nuevo),
      });
    } catch (e) {
      return res.status(403).json({ message: e.message });
    }
  },

  async crearStaff(req, res) {
    try {
      if (!req.user || !["admin", "superadmin"].includes(req.user.role))
        return res.status(403).json({ message: "Solo Admin/SuperAdmin" });

      const { username, password, nombre, apellido, permisos } = req.body;

      if (!username || !password || !nombre || !apellido)
        return res.status(400).json({ message: "Faltan campos" });

      const nuevo = await AdminService.crearStaff(
        { username, password, nombre, apellido, permisos },
        req.user
      );

      return res.status(201).json({
        message: "Staff creado",
        staff: staffResponseDTO(nuevo),
      });
    } catch (e) {
      return res.status(403).json({ message: e.message });
    }
  },

  /* =========================================================
     🏢 CREAR EMPRESA SIMPLE (solo empresa + cuit → precarga)
  ========================================================= */
  async crearEmpresa(req, res) {
    try {
      if (!req.user?.superadmin)
        return res.status(403).json({ message: "Solo SuperAdmin" });

      const { empresa, cuit } = req.body;

      if (!empresa?.trim() || !cuit?.trim()) {
        return res
          .status(400)
          .json({ message: "Faltan datos obligatorios (empresa, cuit)" });
      }

      const nueva = await AdminService.crearEmpresaSimple({ empresa, cuit });

      return res.status(201).json({
        message: "Empresa precargada correctamente",
        empresa: nueva,
      });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  /* =========================================================
     ✔ VALIDAR CUIT PARA REGISTRO
  ========================================================= */
  async validarEmpresa(req, res) {
    try {
      const { cuit } = req.body;
      if (!cuit)
        return res.status(400).json({ message: "CUIT requerido" });

      const existe = await AdminService.validarEmpresa(cuit);

      return res.json({ valido: existe });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  /* =========================================================
     📥 IMPORTAR EMPRESAS PRECARGADAS (JSON desde CSV)
     Espera body: { empresas: [{ empresa, cuit }, ...] }
  ========================================================= */
  async importarEmpresas(req, res) {
    try {
      const { empresas } = req.body;

      if (!Array.isArray(empresas)) {
        return res
          .status(400)
          .json({ message: "Formato inválido: se espera empresas[]" });
      }

      const resultados = await AdminService.importarEmpresasPrecargadas(
        empresas
      );

      return res.json({ resultados });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  /* =========================================================
     📋 LISTAR ADMINS Y STAFF
  ========================================================= */
  async listar(_req, res) {
    try {
      const lista = await AdminService.listarAdminsYStaff();

      const admins = lista.filter((u) => u.superadmin !== undefined);
      const staff = lista.filter((u) => u.role === "staff");

      return res.json({
        admins: admins.map(adminResponseDTO),
        staff: staff.map(staffResponseDTO),
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  /* =========================================================
     🔎 BUSCAR USUARIO
  ========================================================= */
  async buscarUsuario(req, res) {
    try {
      const { cuit } = req.params;
      if (!cuit) return res.status(400).json({ message: "CUIT requerido" });

      const user = await UserRepository.findByCuit(cuit);
      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado" });

      return res.json(userResponseDTO(user));
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  async me(req, res) {
    return res.json({ user: adminResponseDTO(req.user) });
  },

  async logout(_req, res) {
    clearAllAuthCookies(res);
    return res.json({ message: "Sesión cerrada" });
  },

  /* =========================================================
     📊 RESUMEN SUPERADMIN
  ========================================================= */
  async resumenSuperadmin(_req, res) {
    try {
      const empresas = await UserRepository.countByRole("user");
      const staff = await UserRepository.countByRole("staff");
      const admins = await UserRepository.countByRole("admin");

      return res.json({ empresas, staff, admins });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  async listarUsuariosSistema(_req, res) {
    try {
      const lista = await UserRepository.findAll();
      return res.json(lista);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  /* =========================================================
     🧪 PERFILES DE EXAMEN POR EMPRESA (CUIT)
  ========================================================= */

  async listarPerfiles(req, res) {
    try {
      const { cuit } = req.params;

      const empresa = await UserRepository.findByCuit(cuit);
      if (!empresa)
        return res.status(404).json({ message: "Empresa no encontrada" });

      return res.json(empresa.perfilesExamen || []);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  async crearPerfil(req, res) {
    try {
      const { cuit } = req.params;
      const { nombrePerfil, estudios, descripcion } = req.body;

      const empresa = await UserRepository.findByCuit(cuit);
      if (!empresa)
        return res.status(404).json({ message: "Empresa no encontrada" });

      empresa.perfilesExamen.push({
        nombrePerfil,
        estudios: estudios || [],
        descripcion: descripcion || "",
        activo: true,
      });

      await empresa.save();

      return res.status(201).json({
        message: "Perfil agregado",
        perfiles: empresa.perfilesExamen,
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  async editarPerfil(req, res) {
    try {
      const { cuit, perfilId } = req.params;
      const empresa = await UserRepository.findByCuit(cuit);

      if (!empresa)
        return res.status(404).json({ message: "Empresa no encontrada" });

      const perfil = empresa.perfilesExamen.id(perfilId);
      if (!perfil)
        return res.status(404).json({ message: "Perfil no encontrado" });

      const { nombrePerfil, estudios, descripcion, activo } = req.body;

      if (nombrePerfil !== undefined) perfil.nombrePerfil = nombrePerfil;
      if (estudios !== undefined) perfil.estudios = estudios;
      if (descripcion !== undefined) perfil.descripcion = descripcion;
      if (activo !== undefined) perfil.activo = activo;

      await empresa.save();

      return res.json({ message: "Perfil actualizado", perfil });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  async eliminarPerfil(req, res) {
    try {
      const { cuit, perfilId } = req.params;
      const empresa = await UserRepository.findByCuit(cuit);

      if (!empresa)
        return res.status(404).json({ message: "Empresa no encontrada" });

      const perfil =
        empresa.perfilesExamen.id(perfilId) ||
        empresa.perfilesExamen.find((p) => p._id?.toString() === perfilId) ||
        empresa.perfilesExamen.find((p) => p.id === perfilId);

      if (!perfil)
        return res.status(404).json({ message: "Perfil no encontrado" });

      perfil.deleteOne();
      await empresa.save();

      return res.json({
        message: "Perfil eliminado",
        perfiles: empresa.perfilesExamen,
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  /* =========================================================
     (LEGACY) IMPORTAR USUARIOS COMPLETOS
     (lo dejo igual por si ya lo usás)
  ========================================================= */
  async importarUsuarios(req, res) {
    try {
      const { usuarios } = req.body;

      if (!Array.isArray(usuarios)) {
        return res.status(400).json({ message: "Formato inválido" });
      }

      const resultados = [];

      for (const u of usuarios) {
        try {
          const existe = await UserRepository.findByCuit(u.cuit);
          if (existe) {
            resultados.push({ cuit: u.cuit, status: "existente" });
            continue;
          }

          await UserRepository.crear({
            empresa: u.empresa,
            cuit: u.cuit,
            contacto: {
              nombre: u.contactoNombre || null,
              email: u.contactoEmail || null,
            },
            password: u.password || "temporal123",
            role: "user",
          });

          resultados.push({ cuit: u.cuit, status: "creado" });
        } catch (err) {
          resultados.push({
            cuit: u.cuit || "-",
            status: "error",
            error: err.message,
          });
        }
      }

      return res.json({ resultados });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  async importarEmpresasCSV(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Debes subir un archivo CSV" });
    }

    const empresas = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        if (row.empresa && row.cuit) {
          empresas.push({
            empresa: row.empresa.trim(),
            cuit: row.cuit.trim(),
          });
        }
      })
      .on("end", async () => {
        const resultados = [];

        for (const e of empresas) {
          try {
            const existe = await UserRepository.findByCuit(e.cuit);
            if (existe) {
              resultados.push({ cuit: e.cuit, status: "existente" });
              continue;
            }

            await UserRepository.crear({
              empresa: e.empresa,
              cuit: e.cuit,
              role: "user",
              contacto: undefined,
              password: undefined,
              perfilesExamen: [],
            });

            resultados.push({ cuit: e.cuit, status: "creado" });
          } catch (err) {
            resultados.push({
              cuit: e.cuit,
              status: "error",
              error: err.message,
            });
          }
        }

        fs.unlinkSync(req.file.path); // borrar archivo temporal

        return res.json({ resultados });
      });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
},

};

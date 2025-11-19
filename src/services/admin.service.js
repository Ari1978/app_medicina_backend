// src/services/admin.service.js
import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository.js";
import { EmpresaPrecargadaRepository } from "../repositories/empresaPrecargada.repository.js";

export const AdminService = {
  /* =========================================================
     🔐 LOGIN ADMIN / SUPERADMIN
  ========================================================= */
  async login(username, password) {
    const admin = await UserRepository.findByUsername(username);
    if (!admin) throw new Error("Credenciales incorrectas");

    const match = await bcrypt.compare(password, admin.password);
    if (!match) throw new Error("Credenciales incorrectas");

    return admin;
  },

  /* =========================================================
     🛠️ CREAR ADMIN
  ========================================================= */
  async crearAdmin(data, creador) {
    const { username, password, nombre, apellido, superadmin } = data;

    const existe = await UserRepository.findByUsername(username);
    if (existe) throw new Error("El usuario ya existe");

    const hash = await bcrypt.hash(password, 10);

    return await UserRepository.crear({
      username,
      password: hash,
      nombre,
      apellido,
      role: "admin",
      superadmin: superadmin === true,
      creadoPor: creador._id,
    });
  },

  /* =========================================================
     🧑‍💼 CREAR STAFF
  ========================================================= */
  async crearStaff(data, creador) {
    const { username, password, nombre, apellido, permisos } = data;

    const existe = await UserRepository.findByUsername(username);
    if (existe) throw new Error("El usuario ya existe");

    const hash = await bcrypt.hash(password, 10);

    return await UserRepository.crear({
      username,
      password: hash,
      nombre,
      apellido,
      role: "staff",
      permisos: Array.isArray(permisos) ? permisos : [],
      creadoPor: creador._id,
    });
  },

  /* =========================================================
     🏢 CREAR EMPRESA SIMPLE (solo precarga: empresa + cuit)
  ========================================================= */
  async crearEmpresaSimple(data) {
    const { empresa, cuit } = data;

    const cuitTrim = (cuit || "").trim();
    const empresaTrim = (empresa || "").trim();

    if (!empresaTrim || !cuitTrim) {
      throw new Error("Empresa y CUIT son obligatorios");
    }

    // Si ya hay un usuario registrado con ese CUIT, no dejamos precargar
    const yaRegistrado = await UserRepository.findByCuit(cuitTrim);
    if (yaRegistrado) throw new Error("Ya existe un usuario registrado con ese CUIT");

    const existePrecarga = await EmpresaPrecargadaRepository.findByCuit(cuitTrim);
    if (existePrecarga) throw new Error("La empresa ya está precargada");

    return await EmpresaPrecargadaRepository.crear({
      empresa: empresaTrim,
      cuit: cuitTrim,
      habilitado: true,
    });
  },

  /* =========================================================
     ✔ VALIDAR CUIT PARA REGISTRO
     - Devuelve true SOLO si:
       1) Está en EmpresaPrecargada (habilitado)
       2) Todavía NO hay User con ese CUIT
  ========================================================= */
  async validarEmpresa(cuit) {
    const cuitTrim = (cuit || "").trim();
    if (!cuitTrim) return false;

    const precargada = await EmpresaPrecargadaRepository.findByCuit(cuitTrim);
    if (!precargada || !precargada.habilitado) return false;

    const yaUser = await UserRepository.findByCuit(cuitTrim);
    if (yaUser) return false;

    return true;
  },

  /* =========================================================
     📥 IMPORTAR EMPRESAS PRECARGADAS (JSON desde CSV)
     Espera: empresas = [{ empresa, cuit }, ...]
  ========================================================= */
  async importarEmpresasPrecargadas(empresas) {
    return await EmpresaPrecargadaRepository.importarLista(empresas);
  },

  /* =========================================================
     📋 LISTAR ADMINS + STAFF
  ========================================================= */
  async listarAdminsYStaff() {
    return await UserRepository.findAdminsAndStaff();
  },

  async importarEmpresasCsv(empresas) {
  const resultados = [];

  for (const e of empresas) {
    try {
      if (!e.empresa || !e.cuit) {
        resultados.push({
          cuit: e.cuit || "-",
          status: "error",
          error: "Faltan datos"
        });
        continue;
      }

      const existe = await UserRepository.findByCuit(e.cuit);
      if (existe) {
        resultados.push({ cuit: e.cuit, status: "existente" });
        continue;
      }

      await UserRepository.crear({
        empresa: e.empresa,
        cuit: e.cuit,
        role: "user",
        contacto: { nombre: "", email: "" },
        password: "",
        perfilesExamen: []
      });

      resultados.push({ cuit: e.cuit, status: "creado" });

    } catch (err) {
      resultados.push({
        cuit: e.cuit || "-",
        status: "error",
        error: err.message,
      });
    }
  }

  return resultados;
}

};

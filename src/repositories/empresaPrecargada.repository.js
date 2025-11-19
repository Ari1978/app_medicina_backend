
// src/repositories/empresaPrecargada.repository.js
import EmpresaPrecargadaModel from "../models/empresaPrecargada.model.js";

export const EmpresaPrecargadaRepository = {
  async findByCuit(cuit) {
    return await EmpresaPrecargadaModel.findOne({ cuit });
  },

  async crear({ empresa, cuit, habilitado = true }) {
    return await EmpresaPrecargadaModel.create({ empresa, cuit, habilitado });
  },

  // Precarga masiva desde lista [{ empresa, cuit }, ...]
  async importarLista(empresas) {
    const resultados = [];

    for (const e of empresas) {
      try {
        const empresa = (e.empresa || "").trim();
        const cuit = (e.cuit || "").trim();

        if (!empresa || !cuit) {
          resultados.push({
            cuit: e.cuit || "-",
            status: "error",
            error: "Faltan campos (empresa o cuit)",
          });
          continue;
        }

        const existe = await EmpresaPrecargadaModel.findOne({ cuit });
        if (existe) {
          resultados.push({ cuit, status: "existente" });
          continue;
        }

        await EmpresaPrecargadaModel.create({ empresa, cuit, habilitado: true });
        resultados.push({ cuit, status: "creado" });
      } catch (err) {
        resultados.push({
          cuit: e.cuit || "-",
          status: "error",
          error: err.message,
        });
      }
    }

    return resultados;
  },
};

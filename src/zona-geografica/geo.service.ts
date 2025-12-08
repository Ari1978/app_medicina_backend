
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Provincia } from './schemas/provincia.schema';
import { Partido } from './schemas/partido.schema';
import { Localidad } from './schemas/localidad.schema';

@Injectable()
export class GeoService {
  constructor(
    @InjectModel(Provincia.name)
    private readonly provinciaModel: Model<Provincia>,

    @InjectModel(Partido.name)
    private readonly partidoModel: Model<Partido>,

    @InjectModel(Localidad.name)
    private readonly localidadModel: Model<Localidad>,
  ) {}

 // ====================================
// 🔄 SINCRONIZAR TODO DESDE GEOREF (SEGURO)
// ====================================
async syncTodo() {
  console.log("🔥 INICIANDO SYNC GEO");

  const fetchConTimeout = async (url: string, ms = 15000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      clearTimeout(timeout);
      throw new Error("Timeout o error al conectar con Georef");
    }
  };

  // ==========================
  // 1️⃣ PROVINCIAS
  // ==========================
  const provRes = await fetchConTimeout(
    "https://apis.datos.gob.ar/georef/api/provincias"
  );

  const provData: any = await provRes.json();

  let totalProvincias = 0;
  let totalPartidos = 0;
  let totalLocalidades = 0;

  for (const p of provData.provincias) {
    totalProvincias++;
    console.log("📍 Provincia:", p.nombre);

    await this.provinciaModel.updateOne(
      { nombre: p.nombre },
      { nombre: p.nombre },
      { upsert: true },
    );

    // ==========================
    // 2️⃣ PARTIDOS POR PROVINCIA
    // ==========================
    try {
      const partRes = await fetchConTimeout(
        `https://apis.datos.gob.ar/georef/api/municipios?provincia=${encodeURIComponent(
          p.nombre,
        )}&max=200`
      );

      const partData: any = await partRes.json();

      for (const m of partData.municipios) {
        totalPartidos++;

        await this.partidoModel.updateOne(
          { nombre: m.nombre, provincia: p.nombre },
          { nombre: m.nombre, provincia: p.nombre },
          { upsert: true },
        );

        // ==========================
        // 3️⃣ LOCALIDADES POR PARTIDO
        // ==========================
        try {
          const locRes = await fetchConTimeout(
            `https://apis.datos.gob.ar/georef/api/localidades?municipio=${encodeURIComponent(
              m.nombre,
            )}&max=200`
          );

          const locData: any = await locRes.json();

          for (const l of locData.localidades) {
            totalLocalidades++;

            await this.localidadModel.updateOne(
              {
                nombre: l.nombre,
                provincia: p.nombre,
                partido: m.nombre,
              },
              {
                nombre: l.nombre,
                provincia: p.nombre,
                partido: m.nombre,
              },
              { upsert: true },
            );
          }

        } catch (err) {
          console.warn("⚠️ Fallaron localidades de:", m.nombre);
        }
      }

    } catch (err) {
      console.warn("⚠️ Fallaron partidos de:", p.nombre);
    }
  }

  return {
    ok: true,
    message: "Geografía sincronizada correctamente",
    provincias: totalProvincias,
    partidos: totalPartidos,
    localidades: totalLocalidades,
  };
}

// ====================================
// ✅ GETTERS PARA EL FRONT
// ====================================

async getProvincias() {
  return this.provinciaModel.find().sort({ nombre: 1 });
}

async getPartidos(provincia: string) {
  return this.partidoModel
    .find({ provincia })
    .sort({ nombre: 1 });
}

async getLocalidades(provincia: string, partido: string) {
  return this.localidadModel
    .find({ provincia, partido })
    .sort({ nombre: 1 });
}


}

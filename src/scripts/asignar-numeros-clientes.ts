import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { EmpresaSchema } from "../empresa/schemas/empresa.schema";

// Cargar variables de entorno
dotenv.config();

async function run() {
  console.log("🚀 Conectando a MongoDB...");

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ ERROR: MONGO_URI no está definido en .env");
    process.exit(1);
  }

  await mongoose.connect(uri);

  const Empresa = mongoose.model("Empresa", EmpresaSchema, "empresas");

  console.log("📌 Asignando números de cliente...");

  const empresas = await Empresa.find().sort({ createdAt: 1 });

  let numero = 1001;

  for (const e of empresas) {
    if (!e.numeroCliente) {
      e.numeroCliente = numero++;
      await e.save();
      console.log(`✔ ${e.razonSocial} => ${e.numeroCliente}`);
    }
  }

  console.log("🎉 Finalizado.");
  process.exit(0);
}

run().catch(console.error);

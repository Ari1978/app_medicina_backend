import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../utils/crypto.js";

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    role: { type: String, default: "admin" },
    superadmin: { type: Boolean, default: false },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

AdminSchema.methods.comparePassword = function (plainPassword) {
  return comparePassword(plainPassword, this.password);
};

export default mongoose.model("Admin", AdminSchema);


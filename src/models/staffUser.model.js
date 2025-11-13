import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../utils/crypto.js";

const StaffSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    nombre:   { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    role:     { type: String, default: "staff" },
    permisos: { type: [String], default: [] },
    activo:   { type: Boolean, default: true },

    // 🧾 Auditoría
    creadoPor: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
      role:   { type: String, enum: ["admin", "superadmin"], required: false },
    },
  },
  { timestamps: true }
);

StaffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

StaffSchema.methods.comparePassword = function (plain) {
  return comparePassword(plain, this.password);
};

export default mongoose.model("Staff", StaffSchema);

import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads/csv");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `empresas-${Date.now()}${ext}`);
  },
});

export const uploadCsv = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.match(/\.csv$/i)) {
      return cb(new Error("Solo se aceptan archivos CSV"), false);
    }
    cb(null, true);
  },
});

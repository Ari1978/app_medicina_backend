import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

export class ImageConverter {
  /**
   * Normaliza una imagen a JPG optimizado para preview.
   * - Sirve para PNG/JPG/WEBP/etc.
   * - Genera un JPG con calidad configurable.
   * - Opcionalmente redimensiona.
   */
  static async generarPreviewJpg(inputPath: string, opts?: {
    outputPath?: string;
    maxWidth?: number;     // ej 1400
    quality?: number;      // 1..100 (default 85)
  }): Promise<string> {
    const quality = opts?.quality ?? 85;
    const outputPath =
      opts?.outputPath ?? inputPath.replace(/\.[^/.]+$/, '.jpg');

    // resize opcional manteniendo aspect ratio
    const resize = opts?.maxWidth
      ? `-resize ${opts.maxWidth}x`
      : '';

    // -strip: borra metadata (más liviano)
    // -auto-orient: corrige rotación por EXIF
    // -colorspace sRGB: consistente para web
    const cmd = `magick "${inputPath}" -auto-orient ${resize} -strip -colorspace sRGB -quality ${quality} "${outputPath}"`;

    await execAsync(cmd);

    if (!fs.existsSync(outputPath)) {
      throw new Error('No se pudo generar preview de imagen');
    }

    return outputPath;
  }
}

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export class DicomConverter {
  static async generarPreview(inputPath: string): Promise<string> {
    const outputPath = inputPath.replace(/\.dcm$/i, '.jpg');

    await execAsync(
      `magick "${inputPath}" -auto-level "${outputPath}"`
    );

    if (!fs.existsSync(outputPath)) {
      throw new Error('No se pudo generar preview DICOM');
    }

    return outputPath;
  }
}

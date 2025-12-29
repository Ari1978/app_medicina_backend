import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export class OfficeConverter {
  static async convertirAPdf(inputPath: string): Promise<string> {
    const outputDir = path.dirname(inputPath);

    await execAsync(
      `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`
    );

    const pdfPath = inputPath.replace(/\.(docx?|xlsx?|pptx?)$/i, '.pdf');

    if (!fs.existsSync(pdfPath)) {
      throw new Error('Error al convertir archivo Office a PDF');
    }

    return pdfPath;
  }
}

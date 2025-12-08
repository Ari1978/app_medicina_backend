
import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfStorageService {
  // 🚧 TEMPORAL: después lo conectamos a Cloudinary / S3 / Supabase
  async uploadPdf(file: Express.Multer.File): Promise<string> {
    // Por ahora devolvemos URL fake
    return `https://example.com/pdf/${Date.now()}.pdf`;
  }
}

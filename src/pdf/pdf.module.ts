import { Module } from '@nestjs/common';
import { TurnoPdfService } from './tunro-pdf.service';

@Module({
  providers: [TurnoPdfService],
  exports: [TurnoPdfService], // 👈 clave absoluta
})
export class PdfModule {}

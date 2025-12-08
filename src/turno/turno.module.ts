// src/turno/turno.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Turno, TurnoSchema } from './schema/turno.schema';
import { TurnoService } from './turno.service';
import { TurnoController } from './turno.controller';
import { AvailabilityModule } from '../availability/availability.module';
import { PdfStorageService } from 'src/examenes/pdf-storage.service';
import { TurnoPdfService } from './turno-pdf.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Turno.name, schema: TurnoSchema }]),

    // 🔥 Necesario para evitar circular import y permitir usar AvailabilityService aquí
    forwardRef(() => AvailabilityModule),
  ],

  controllers: [TurnoController],
  providers: [
    TurnoService,
    PdfStorageService,
    TurnoPdfService
  ],
 

  // 🔥 Exportás TurnoService para que Availability lo pueda inyectar
  exports: [
    TurnoService,
    PdfStorageService,
    TurnoPdfService
  ],
    
})
export class TurnoModule {}

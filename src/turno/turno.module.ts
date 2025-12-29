// src/turno/turno.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Turno, TurnoSchema } from './schema/turno.schema';
import { TurnoService } from './turno.service';
import { TurnoController } from './turno.controller';
import { AvailabilityModule } from '../availability/availability.module';
import { PdfStorageService } from 'src/examenes/pdf-storage.service';
import { TurnoPdfService } from './turno-pdf.service';
import { PracticasModule } from 'src/practicas/practicas.module';
import { PerfilExamenModule } from 'src/perfil-examen/perfil-examen.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Turno.name, schema: TurnoSchema }]),
    forwardRef(() => AvailabilityModule),
    PracticasModule,
    PerfilExamenModule,
  ],
  controllers: [TurnoController],
  providers: [
    TurnoService,
    PdfStorageService,
    TurnoPdfService,
  ],
  exports: [
    TurnoService,
    PdfStorageService,
    TurnoPdfService,

  ],
})
export class TurnoModule {}

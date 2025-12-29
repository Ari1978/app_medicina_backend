import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RecepcionController } from './recepcion.controller';
import { RecepcionService } from './recepcion.service';

import { Turno, TurnoSchema } from '../../turno/schema/turno.schema';
import { PracticasModule } from 'src/practicas/practicas.module';
import { PdfModule } from '../../pdf/pdf.module'; // 👈 IMPORTANTE

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Turno.name, schema: TurnoSchema },
    ]),
    PracticasModule,
    PdfModule, // 👈 ESTA LÍNEA FALTABA
  ],
  controllers: [RecepcionController],
  providers: [RecepcionService],
})
export class RecepcionModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdjuntosService } from './adjuntos.service';
import { AdjuntosController } from './adjuntos.controller';

import {
  AdjuntoPractica,
  AdjuntoPracticaSchema,
} from './schemas/adjunto-practica.schema';

import { PracticasModule } from '../practicas/practicas.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdjuntoPractica.name, schema: AdjuntoPracticaSchema },
    ]),
    PracticasModule,
  ],
  controllers: [AdjuntosController],
  providers: [AdjuntosService],
})
export class AdjuntosModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AdjuntoPractica,
  AdjuntoPracticaSchema,
} from '../adjuntos/schemas/adjunto-practica.schema';

import { InformeFinalService } from './informe-final.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AdjuntoPractica.name,
        schema: AdjuntoPracticaSchema,
      },
    ]),
  ],
  providers: [InformeFinalService],
  exports: [InformeFinalService],
})
export class InformesModule {}

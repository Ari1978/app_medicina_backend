
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RecepcionController } from './recepcion.controller';
import { RecepcionService } from './recepcion.service';

import { Turno, TurnoSchema } from '../../turno/schema/turno.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Turno.name, schema: TurnoSchema },
    ]),
  ],
  controllers: [RecepcionController],
  providers: [RecepcionService],
})
export class RecepcionModule {}

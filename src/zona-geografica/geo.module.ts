
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GeoService } from './geo.service';
import { GeoController } from './geo.controller';

import { Provincia, ProvinciaSchema } from './schemas/provincia.schema';
import { Partido, PartidoSchema } from './schemas/partido.schema';
import { Localidad, LocalidadSchema } from './schemas/localidad.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Provincia.name, schema: ProvinciaSchema },
      { name: Partido.name, schema: PartidoSchema },
      { name: Localidad.name, schema: LocalidadSchema },
    ]),
  ],
  controllers: [GeoController],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}

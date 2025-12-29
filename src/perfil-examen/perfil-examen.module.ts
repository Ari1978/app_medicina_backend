import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PerfilExamenController } from './perfil-examen.controller';
import { PerfilExamenService } from './perfil-examen.service';
import { PerfilExamen, PerfilExamenSchema } from './schemas/perfil-examen.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PerfilExamen.name, schema: PerfilExamenSchema },
    ]),
  ],
  controllers: [PerfilExamenController],
  providers: [PerfilExamenService],
  exports: [PerfilExamenService, MongooseModule],
})
export class PerfilExamenModule {}

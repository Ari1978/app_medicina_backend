import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  PreInforme,
  PreInformeSchema,
} from './schema/pre-informe.schema';
import { PreInformesService } from './pre-informes.service';
import { PreInformesController } from './pre-informes.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PreInforme.name, schema: PreInformeSchema },
    ]),
  ],
  providers: [PreInformesService],
  controllers: [PreInformesController],
})
export class PreInformesModule {}

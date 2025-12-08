import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmpresaPrecargada,
  EmpresaPrecargadaSchema,
} from './schemas/empresaPrecargada.schema';
import { EmpresaPrecargadaService } from './empresaPrecargada.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmpresaPrecargada.name, schema: EmpresaPrecargadaSchema },
    ]),
  ],
  providers: [EmpresaPrecargadaService],
  exports: [EmpresaPrecargadaService],
})
export class EmpresaPrecargadaModule {}

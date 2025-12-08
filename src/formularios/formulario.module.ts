
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Formulario, FormularioSchema } from './formulario.schema';
import { FormulariosService } from './formulario.service';

import { FormularioEmpresaController } from './formulario-empresa.controller';
import { FormularioStaffController } from './formulario-staff.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Formulario.name, schema: FormularioSchema },
    ]),
  ],
  controllers: [FormularioEmpresaController, FormularioStaffController],
  providers: [FormulariosService],
  exports: [FormulariosService],
})
export class FormularioModule {}

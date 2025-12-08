import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Empresa schema
import { Empresa, EmpresaSchema } from './schemas/empresa.schema';
import { EmpresaService } from './empresa.service';

// Controllers
import { EmpresaController } from './empresa.controller';
import { EmpresaExamenController } from './empresa-examen.controller';
import { EmpresaFormulariosController } from './empresa-formularios.controller';

// Otros módulos
import { EmpresaPrecargadaModule } from './empresaPrecargada.module';
import { FormularioModule } from '../formularios/formulario.module';
import { TurnoModule } from 'src/turno/turno.module';

// Auth
import { JwtEmpresaStrategy } from '../auth/strategies/jwt-empresa.strategy';
import { EmpresaPublicController } from './empresa-public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Empresa.name, schema: EmpresaSchema },
    ]),

    EmpresaPrecargadaModule,
    TurnoModule,
    FormularioModule,   // <-- ESTE ES EL ÚNICO QUE NECESITÁS
  ],

  controllers: [
    EmpresaController,
    EmpresaExamenController,
    EmpresaFormulariosController,
    EmpresaPublicController
  ],

  providers: [
    EmpresaService,
    JwtEmpresaStrategy,
  ],

  exports: [
    EmpresaService,
    MongooseModule,
  ],
})
export class EmpresaModule {}

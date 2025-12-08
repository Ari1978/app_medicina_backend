import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SuperAdminController } from './superadmin.controller';
import { SuperAdminService } from './superadmin.service';

import { JwtSuperAdminStrategy } from '../auth/strategies/jwt-superadmin.strategy';
import { SuperAdminSeed } from './superadmin.seed';

import { Localidad, LocalidadSchema } from '../zona-geografica/schemas/localidad.schema';
import { Admin, AdminSchema } from '../admin/schemas/admin.schema';
import { StaffUser, StaffUserSchema } from '../staff-user/staff-user.schema';
import {
  EmpresaPrecargada,
  EmpresaPrecargadaSchema,
} from '../empresa/schemas/empresaPrecargada.schema';
import { Empresa, EmpresaSchema } from '../empresa/schemas/empresa.schema';

// ✅ Módulos externos
import { SedeModule } from '../sedes/sede.module';
import { EmpresaModule } from '../empresa/empresa.module';
import { PerfilExamenModule } from '../perfil-examen/perfil-examen.module'; // ✅ ESTE ERA EL CLAVE

@Module({
  imports: [
    ConfigModule,

    EmpresaModule,
    SedeModule,
    PerfilExamenModule, // ✅ SOLUCIONA EL ERROR DE PerfilExamenModel

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),

    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: StaffUser.name, schema: StaffUserSchema },
      { name: EmpresaPrecargada.name, schema: EmpresaPrecargadaSchema },
      { name: Empresa.name, schema: EmpresaSchema },
      { name: Localidad.name, schema: LocalidadSchema },
    ]),
  ],

  controllers: [SuperAdminController],

  providers: [
    SuperAdminService,
    JwtSuperAdminStrategy,
    SuperAdminSeed,
  ],
})
export class SuperAdminModule {}

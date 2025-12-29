import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';

import { EmpresaModule } from './empresa/empresa.module';
import { AuthModule } from './auth/auth.module';
import { SuperAdminModule } from './superadmin/superadmin.module';
import { AdminModule } from './admin/admin.module';
import { StaffModule } from './staff/staff.module';
import { TurnoModule } from './turno/turno.module';

import { PerfilExamenModule } from './perfil-examen/perfil-examen.module';
import { AvailabilityModule } from './availability/availability.module';
import { SedeModule } from './sedes/sede.module';
import { RecepcionModule } from './staff/recepcion/recepcion.module';
import { GeoModule } from './zona-geografica/geo.module';
import { PracticasModule } from './practicas/practicas.module';
import { PreInformesModule } from './pre-informes/pre-informes.module';
import { ServiciosModule } from './servicios/servicios.module';

@Module({
  imports: [
    // =============================
    // CONFIG
    // =============================
    ConfigModule.forRoot({ isGlobal: true }),

    // =============================
    // DATABASE
    // =============================
    MongooseModule.forRoot(process.env.MONGO_URI as string),

    // =============================
    // SECURITY — RATE LIMIT (GLOBAL)
    // =============================
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // ventana de 60 segundos
          limit: 100, // límite global
        },
      ],
    }),

    // =============================
    // MODULES
    // =============================
    AvailabilityModule,
    EmpresaModule,
    AuthModule,
    SuperAdminModule,
    AdminModule,
    StaffModule,
    TurnoModule,
    PerfilExamenModule,
    SedeModule,
    RecepcionModule,
    GeoModule,
    PracticasModule,
    PreInformesModule,
    ServiciosModule,
  ],
})
export class AppModule {}

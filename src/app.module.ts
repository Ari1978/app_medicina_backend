import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

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




@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRoot(process.env.MONGO_URI as string),
    
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
    GeoModule

  ],
})
export class AppModule {}

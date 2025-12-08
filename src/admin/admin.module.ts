import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { Admin, AdminSchema } from './schemas/admin.schema';
import { Staff, StaffSchema } from '../staff/schemas/staff.schema';

import { StaffModule } from '../staff/staff.module';
import { StaffUserModule } from '../staff-user/staff-user.module';
import { EmpresaPrecargadaModule } from '../empresa/empresaPrecargada.module';

import { AdminExamenController } from './admin-examen.controller';
import { PdfStorageService } from '../examenes/pdf-storage.service';
import { TurnoModule } from '../turno/turno.module';

import { AdminSedeController } from './admin-sede.controller';

// 🔥 ESTO ES LO QUE FALTABA
import { SedeModule } from '../sedes/sede.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Staff.name, schema: StaffSchema },
    ]),
    StaffModule,
    StaffUserModule,
    EmpresaPrecargadaModule,
    TurnoModule,

    // 🔥 NECESARIO PARA QUE Admin pueda usar SedeService
    SedeModule,
  ],
  controllers: [
    AdminController,
    AdminExamenController,
    AdminSedeController,
  ],
  providers: [
    AdminService,
    PdfStorageService,
  ],
  exports: [AdminService],
})
export class AdminModule {}

// src/availability/availability.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';

import { Availability, AvailabilitySchema } from './schemas/availability.schema';

import { BlocksService } from './blocks.service';
import { FeriadosService } from './feriados.service';
import { AvailabilityCacheService } from './availability.cache.service';
import { AvailabilityEventsService } from './availability.events.service';

// ✅ Import REAL del módulo Turno
import { TurnoModule } from '../turno/turno.module';

// ✅ IMPORT CLAVE QUE TE FALTABA
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Availability.name, schema: AvailabilitySchema },
    ]),

    forwardRef(() => TurnoModule),

    // ✅ SIN ESTO, EL GUARD NO FUNCIONA EN ESTE MÓDULO
    AuthModule,
  ],

  controllers: [AvailabilityController],

  providers: [
    AvailabilityService,
    BlocksService,
    FeriadosService,
    AvailabilityCacheService,
    AvailabilityEventsService,
  ],

  exports: [
    AvailabilityService,
    AvailabilityEventsService,
  ],
})
export class AvailabilityModule {}

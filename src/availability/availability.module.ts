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

// ⚠ Import correcto y REAL del módulo Turno
import { TurnoModule } from '../turno/turno.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Availability.name, schema: AvailabilitySchema },
    ]),

    forwardRef(() => TurnoModule),
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

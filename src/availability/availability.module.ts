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

import { TurnoModule } from '../turno/turno.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Availability.name, schema: AvailabilitySchema },
    ]),

    forwardRef(() => TurnoModule),

    // ✅ ESTO ES LO CORRECTO
    forwardRef(() => AuthModule),
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

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// schemas
import {
  ServicioUser,
  ServicioUserSchema,
} from './schemas/servicio-user.schema';

// auth
import { ServiciosAuthController } from './auth/servicios-auth.controller';
import { ServiciosAuthService } from './auth/servicios-auth.service';
import { ServiciosJwtStrategy } from '../auth/strategies/servicios-jwt.strategy';

// users (superadmin)
import { ServicioUserController } from './servicios-user.controller';
import { ServicioUserService } from './servicio-user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServicioUser.name, schema: ServicioUserSchema },
    ]),
  ],
  controllers: [
    ServiciosAuthController,
    ServicioUserController, // 👈 SUPERADMIN
  ],
  providers: [
    ServiciosAuthService,
    ServicioUserService,
    ServiciosJwtStrategy,
  ],
  exports: [
    ServicioUserService, // opcional, por si lo necesitás después
  ],
})
export class ServiciosModule {}

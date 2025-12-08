import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmpresaModule } from '../empresa/empresa.module';
import { AdminModule } from '../admin/admin.module';
import { StaffModule } from '../staff/staff.module';
import { SuperAdminModule } from '../superadmin/superadmin.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

// Guards
import { JwtEmpresaGuard } from './guards/jwt-empresa.guard';

// Strategies
import { JwtEmpresaStrategy } from './strategies/jwt-empresa.strategy';
import { JwtAdminStrategy } from './strategies/jwt-admin.estrategy';
import { JwtStaffStrategy } from './strategies/jwt-staff.strategy';
import { JwtSuperAdminStrategy } from './strategies/jwt-superadmin.strategy';

@Module({
  imports: [
    forwardRef(() => EmpresaModule),
    forwardRef(() => AdminModule),
    forwardRef(() => StaffModule),
    forwardRef(() => SuperAdminModule),

    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,

    // ✅ STRATEGIES
    JwtEmpresaStrategy,
    JwtAdminStrategy,
    JwtStaffStrategy,
    JwtSuperAdminStrategy,

    // ✅ GUARD
    JwtEmpresaGuard,
  ],

  // ✅ ESTO ES LO QUE TE FALTABA
  exports: [
    AuthService,
    JwtEmpresaStrategy,
    JwtEmpresaGuard,
  ],
})
export class AuthModule {}

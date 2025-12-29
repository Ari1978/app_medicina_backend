// src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { EmpresaService } from '../empresa/empresa.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly empresaService: EmpresaService,
    private readonly jwt: JwtService,
  ) {}

  // ========================================
  // 🔹 LOGIN EMPRESA (CUIT + PASSWORD)
  // ========================================
  async loginEmpresa(cuit: string, password: string) {
    const empresa = await this.empresaService.findByCuit(cuit);

    if (!empresa) {
      throw new UnauthorizedException('CUIT incorrecto');
    }

    const ok = await bcrypt.compare(password, empresa.password);
    if (!ok) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // 🔥 JWT BIEN ARMADO
    const token = this.jwt.sign({
      sub: empresa._id.toString(),
      empresaId: empresa._id.toString(),
      role: 'empresa',
    });

    return { empresa, token };
  }

  // ========================================
  // 🔹 VALIDAR TOKEN (JWT STRATEGY)
  // ========================================
  async validateUser(payload: any) {
    return this.empresaService.findById(payload.empresaId);
  }
}

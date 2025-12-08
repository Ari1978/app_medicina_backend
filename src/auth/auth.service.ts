import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { EmpresaService } from '../empresa/empresa.service';
import { COOKIE_EMPRESA } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private empresaService: EmpresaService,
    private jwt: JwtService,
  ) {}

  // 🔹 LOGIN EMPRESA (CUIT + password)
  async loginEmpresa(cuit: string, password: string) {
  console.log(">>> CUIT RECIBIDO EN AUTH:", JSON.stringify(cuit));
  console.log(">>> PASSWORD RECIBIDO EN AUTH:", JSON.stringify(password));

  const empresa = await this.empresaService.findByCuit(cuit);

  console.log(">>> RESULTADO findByCuit:", empresa);

  if (!empresa) {
    throw new UnauthorizedException("CUIT incorrecto");
  }

  const ok = await bcrypt.compare(password, empresa.password);
  if (!ok) {
    throw new UnauthorizedException("Contraseña incorrecta");
  }

  const token = this.jwt.sign({
    id: empresa._id,
    role: 'empresa',
  });

  return { empresa, token };
}


  // 🔹 Verificar token y devolver empresa
  async validateUser(payload: any) {
    return this.empresaService.findById(payload.id);
  }
}

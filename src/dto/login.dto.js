export class LoginDTO {
  constructor({ cuit, password }) {
    if (!cuit || !cuit.trim()) throw new Error("CUIT es obligatorio");
    if (!password || !password.trim()) throw new Error("Contraseña es obligatoria");
    this.cuit = cuit.trim();
    this.password = password;
  }
}

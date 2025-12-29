import * as crypto from 'crypto';
import * as fs from 'fs';

export function calcularHashArchivo(path: string): string {
  const buffer = fs.readFileSync(path);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

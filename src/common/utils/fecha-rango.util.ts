import { parseFechaLatina } from './fecha.util';

export function rangoDia(fecha: string | Date) {
  const base =
    fecha instanceof Date
      ? fecha
      : parseFechaLatina(fecha);

  const inicio = new Date(base);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(base);
  fin.setHours(23, 59, 59, 999);

  return { inicio, fin };
}

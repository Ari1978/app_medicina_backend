import { Injectable } from '@nestjs/common';

@Injectable()
export class BlocksService {
  generarBloques(inicio: string, fin: string, intervaloMin: number) {
    const bloques: string[] = [];  // ✔ tipado correcto

    let actual = new Date(`1970-01-01T${inicio}:00`);
    const limite = new Date(`1970-01-01T${fin}:00`);

    while (actual <= limite) {
      bloques.push(actual.toTimeString().substring(0, 5));
      actual = new Date(actual.getTime() + intervaloMin * 60000);
    }

    return bloques;
  }
}

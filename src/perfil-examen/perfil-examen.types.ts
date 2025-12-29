// src/perfil-examen/perfil-examen.types.ts

export interface PerfilExamenLean {
  _id: any;
  puesto: string;
  tipo: 'ingreso' | 'periodico' | 'egreso';
  practicasPerfil: string[];
  empresa: any;
  activo: boolean;
}

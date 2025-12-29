// src/practicas/practicas.catalog.ts

/**
 * Práctica médica disponible en el sistema.
 * El código es el ID lógico y único.
 */
export interface PracticaCatalogo {
  codigo: string;
  nombre: string;
  sector: string;
}

/**
 * Catálogo único de prácticas médicas
 * Fuente de verdad para perfiles y turnos
 */
export const CATALOGO_PRACTICAS: PracticaCatalogo[] = [
  // ------------------------
  // LABORATORIO
  // ------------------------
  { codigo: '100', nombre: 'Laboratorio', sector: 'Laboratorio' },
  { codigo: '101', nombre: 'Hemograma completo', sector: 'Laboratorio' },
  { codigo: '102', nombre: 'HIV', sector: 'Laboratorio' },
  { codigo: '103', nombre: 'HGL (Glucemia)', sector: 'Laboratorio' },
  { codigo: '104', nombre: 'Grupo y Factor', sector: 'Laboratorio' },
  { codigo: '105', nombre: 'Subunidad Beta HCG', sector: 'Laboratorio' },
  { codigo: '106', nombre: 'Hepatograma completo', sector: 'Laboratorio' },
  { codigo: '107', nombre: 'VDRL cuantitativa', sector: 'Laboratorio' },
  { codigo: '108', nombre: 'Triglicéridos', sector: 'Laboratorio' },
  { codigo: '109', nombre: 'Colesterol total', sector: 'Laboratorio' },
  { codigo: '110', nombre: 'Perfil lipídico completo', sector: 'Laboratorio' },
  { codigo: '111', nombre: 'Creatinina', sector: 'Laboratorio' },
  { codigo: '112', nombre: 'Uremia', sector: 'Laboratorio' },
  { codigo: '113', nombre: 'Ácido úrico', sector: 'Laboratorio' },
  { codigo: '114', nombre: 'TGO/TGP', sector: 'Laboratorio' },
  { codigo: '115', nombre: 'Colesterol HDL', sector: 'Laboratorio' },
  { codigo: '116', nombre: 'Colesterol LDL', sector: 'Laboratorio' },
  { codigo: '117', nombre: 'PSA Total', sector: 'Laboratorio' },
  { codigo: '118', nombre: 'Glucosa', sector: 'Laboratorio' },
  { codigo: '119', nombre: 'PCR (Proteína C Reactiva)', sector: 'Laboratorio' },

  // ------------------------
  // CLÍNICA MÉDICA
  // ------------------------
  { codigo: '201', nombre: 'Examen médico ingreso', sector: 'Clínica Médica' },
  { codigo: '202', nombre: 'Examen médico periódico', sector: 'Clínica Médica' },
  { codigo: '203', nombre: 'Examen médico egreso', sector: 'Clínica Médica' },
  { codigo: '204', nombre: 'Campimetría', sector: 'Clínica Médica' },
  { codigo: '205', nombre: 'IC Neurológica', sector: 'Clínica Médica' },
  { codigo: '206', nombre: 'IC Neurológica YPF', sector: 'Clínica Médica' },
  { codigo: '207', nombre: 'Encuesta del sueño', sector: 'Clínica Médica' },

  // ------------------------
  // PSICOTÉCNICOS
  // ------------------------
  { codigo: '301', nombre: 'Psicotécnico para chofer', sector: 'Psicología' },
  {
    codigo: '302',
    nombre: 'Psicotécnico para trabajos en espacios confinados',
    sector: 'Psicología',
  },
  {
    codigo: '303',
    nombre: 'Psicotécnico para operador de maquinaria',
    sector: 'Psicología',
  },
  {
    codigo: '304',
    nombre: 'Psicotécnico para personal de seguridad',
    sector: 'Psicología',
  },
  {
    codigo: '305',
    nombre: 'Psicotécnico para trabajo en altura',
    sector: 'Psicología',
  },
  {
    codigo: '306',
    nombre: 'Psicotécnico para administrativo',
    sector: 'Psicología',
  },

  // ------------------------
  // RAYOS
  // ------------------------
  { codigo: '400', nombre: 'Rx Tórax F', sector: 'Rayos' },
  { codigo: '401', nombre: 'Rx Tórax F/P', sector: 'Rayos' },
  { codigo: '402', nombre: 'Rx Antebrazo', sector: 'Rayos' },
  { codigo: '403', nombre: 'Rx Columna Lumbar F/P', sector: 'Rayos' },
  { codigo: '404', nombre: 'Rx Columna Cervical F/P', sector: 'Rayos' },
  { codigo: '405', nombre: 'Rx Mano F/P', sector: 'Rayos' },
  { codigo: '406', nombre: 'Rx Tobillo F/P', sector: 'Rayos' },
  { codigo: '407', nombre: 'Rx Ambas Rodillas F/P', sector: 'Rayos' },
  { codigo: '408', nombre: 'Rx Cráneo F/P', sector: 'Rayos' },

  // ------------------------
  // OTROS
  // ------------------------
  { codigo: '500', nombre: 'Electrocardiograma', sector: 'Cardiología' },
  { codigo: '501', nombre: 'Electroencefalograma', sector: 'Neurología' },
  { codigo: '502', nombre: 'Espirometría', sector: 'Neumonología' },
  { codigo: '503', nombre: 'Audiometría', sector: 'Fonoaudiología' },
  { codigo: '504', nombre: 'Ergometría', sector: 'Cardiología' },
  { codigo: '505', nombre: 'Electronistagmografía', sector: 'Cardiología' },
];

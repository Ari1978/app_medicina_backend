export function parseFechaLatina(fecha: string): Date {
  if (!fecha) {
    throw new Error('Fecha requerida');
  }

  // Acepta DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    const [dd, mm, yyyy] = fecha.split('/');
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  }

  // Acepta ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return new Date(`${fecha}T00:00:00`);
  }

  // Fallback
  const d = new Date(fecha);
  if (isNaN(d.getTime())) {
    throw new Error(`Formato de fecha inválido: ${fecha}`);
  }

  return d;
}

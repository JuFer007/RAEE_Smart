export interface HorarioValor {
  dias: number[];
  inicio: string;
  fin: string;
  sinHorario: boolean;
}

export const DIAS_SEMANA = [
  { id: 0, corto: 'Lun', completo: 'Lunes' },
  { id: 1, corto: 'Mar', completo: 'Martes' },
  { id: 2, corto: 'Mié', completo: 'Miércoles' },
  { id: 3, corto: 'Jue', completo: 'Jueves' },
  { id: 4, corto: 'Vie', completo: 'Viernes' },
  { id: 5, corto: 'Sáb', completo: 'Sábado' },
  { id: 6, corto: 'Dom', completo: 'Domingo' },
] as const;

export const TEXTO_SIN_HORARIO = 'Horario por confirmar';

export function horarioVacio(): HorarioValor {
  return { dias: [], inicio: '08:00', fin: '17:00', sinHorario: false };
}

const ALIAS_DIA: Record<string, number> = {
  lun: 0,
  lunes: 0,
  mar: 1,
  martes: 1,
  mie: 2,
  mier: 2,
  miercoles: 2,
  jue: 3,
  jueves: 3,
  vie: 4,
  viernes: 4,
  sab: 5,
  sabado: 5,
  dom: 6,
  domingo: 6,
};

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function convertirHora(hora: number, minuto: number, meridiano?: string): string | null {
  let horas = hora;
  if (meridiano === 'pm' && horas < 12) horas += 12;
  if (meridiano === 'am' && horas === 12) horas = 0;
  if (horas < 0 || horas > 23 || minuto < 0 || minuto > 59) return null;
  return `${String(horas).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}

function extraerHoras(texto: string): [string | null, string | null] {
  const horas: string[] = [];
  const patron = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi;
  let coincidencia: RegExpExecArray | null = patron.exec(texto);
  while (coincidencia) {
    const convertida = convertirHora(
      Number(coincidencia[1]),
      Number(coincidencia[2] ?? 0),
      coincidencia[3]?.toLowerCase(),
    );
    if (convertida) horas.push(convertida);
    coincidencia = patron.exec(texto);
  }
  return [horas[0] ?? null, horas[1] ?? null];
}

function extraerDias(texto: string): number[] {
  const palabras = normalizar(texto)
    .replace(/\d+/g, ' ')
    .split(/[^a-z]+/)
    .filter(Boolean);
  const dias = new Set<number>();
  const consumidas = new Set<number>();

  for (let i = 0; i < palabras.length; i += 1) {
    const inicio = ALIAS_DIA[palabras[i]];
    if (inicio === undefined) continue;
    if (palabras[i + 1] === 'a' && ALIAS_DIA[palabras[i + 2]] !== undefined) {
      const fin = ALIAS_DIA[palabras[i + 2]];
      const paso = fin >= inicio ? 1 : -1;
      for (let dia = inicio; ; dia += paso) {
        dias.add(dia);
        if (dia === fin) break;
      }
      consumidas.add(i);
      consumidas.add(i + 1);
      consumidas.add(i + 2);
      i += 2;
    }
  }

  palabras.forEach((palabra, i) => {
    if (consumidas.has(i)) return;
    const dia = ALIAS_DIA[palabra];
    if (dia !== undefined) dias.add(dia);
  });

  return [...dias].sort((a, b) => a - b);
}

export function parsearHorario(texto: string | null | undefined): HorarioValor | null {
  if (!texto?.trim()) return null;
  const normalizado = normalizar(texto);
  if (normalizado.includes('confirmar')) {
    return { ...horarioVacio(), sinHorario: true };
  }
  const [inicio, fin] = extraerHoras(normalizado);
  const dias = extraerDias(normalizado);
  if (!dias.length && !inicio && !fin) return null;
  return {
    dias,
    inicio: inicio ?? '08:00',
    fin: fin ?? '17:00',
    sinHorario: false,
  };
}

export function formatearHorario(valor: HorarioValor): string {
  if (valor.sinHorario) return TEXTO_SIN_HORARIO;
  if (!valor.dias.length || !valor.inicio || !valor.fin) return '';

  const ordenados = [...valor.dias].sort((a, b) => a - b);
  const grupos: number[][] = [];
  ordenados.forEach((dia) => {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && dia === ultimo[ultimo.length - 1] + 1) {
      ultimo.push(dia);
    } else {
      grupos.push([dia]);
    }
  });

  const partes = grupos.map((grupo) => {
    const primero = DIAS_SEMANA[grupo[0]].completo.toLowerCase();
    if (grupo.length === 1) return primero;
    const ultimo = DIAS_SEMANA[grupo[grupo.length - 1]].completo.toLowerCase();
    return grupo.length === 2 ? `${primero} y ${ultimo}` : `${primero} a ${ultimo}`;
  });

  const unidos =
    partes.length <= 2
      ? partes.join(' y ')
      : `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
  const textoDias = unidos.charAt(0).toUpperCase() + unidos.slice(1);

  return `${textoDias} · ${valor.inicio} a ${valor.fin}`;
}

interface OpcionesValidacion {
  obligatorio?: boolean;
  permitirSinHorario?: boolean;
  permitirVacio?: boolean;
}

export function validarHorario(
  valor: HorarioValor,
  opciones: OpcionesValidacion = {},
): string | null {
  const {
    obligatorio = true,
    permitirSinHorario = true,
    permitirVacio = false,
  } = opciones;

  if (valor.sinHorario) {
    return permitirSinHorario ? null : 'Indica los días y las horas de atención.';
  }

  if (
    permitirVacio &&
    valor.dias.length === 0 &&
    valor.inicio === '08:00' &&
    valor.fin === '17:00'
  ) {
    return null;
  }

  if (!valor.dias.length) return 'Selecciona al menos un día.';

  const patronHora = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!patronHora.test(valor.inicio) || !patronHora.test(valor.fin)) {
    return 'Ingresa horas válidas.';
  }

  const aMinutos = (hora: string) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3));
  const inicio = aMinutos(valor.inicio);
  const fin = aMinutos(valor.fin);

  if (inicio < 8 * 60 || fin > 18 * 60) {
    return 'La hora debe estar entre las 08:00 y las 18:00.';
  }
  if (inicio % 15 !== 0 || fin % 15 !== 0) {
    return 'Usa intervalos de 15 minutos.';
  }
  if (fin <= inicio) {
    return 'La hora de fin debe ser posterior a la de inicio.';
  }
  if (fin - inicio < 30) {
    return 'La duración mínima es de 30 minutos.';
  }

  const texto = formatearHorario(valor);
  if (!texto && obligatorio) return 'El horario de atención es obligatorio.';
  if (texto.length > 100) return 'El horario no debe superar los 100 caracteres.';

  return null;
}

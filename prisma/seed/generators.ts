/**
 * Custom Spanish-language random data generators for seeding
 * Lightweight, no external dependencies
 */

// Spanish first names (common in Mexico)
const NOMBRES = [
  'Juan',
  'María',
  'Carlos',
  'Ana',
  'José',
  'Carmen',
  'Luis',
  'Rosa',
  'Miguel',
  'Patricia',
  'Francisco',
  'Guadalupe',
  'Pedro',
  'Verónica',
  'Manuel',
  'Leticia',
  'Jorge',
  'Alejandra',
  'Fernando',
  'Sandra',
  'Roberto',
  'Claudia',
  'Ricardo',
  'Gabriela',
  'Arturo',
  'Mónica',
  'Eduardo',
  'Teresa',
  'Javier',
  'Adriana',
  'Raúl',
  'Silvia',
  'Óscar',
  'Elizabeth',
  'Sergio',
  'Norma',
  'Enrique',
  'Margarita',
  'Alberto',
  'Yolanda',
];

// Spanish surnames (common in Mexico)
const APELLIDOS = [
  'García',
  'Rodríguez',
  'Martínez',
  'López',
  'González',
  'Hernández',
  'Pérez',
  'Sánchez',
  'Ramírez',
  'Torres',
  'Flores',
  'Rivera',
  'Gómez',
  'Díaz',
  'Cruz',
  'Morales',
  'Reyes',
  'Gutiérrez',
  'Ortiz',
  'Ruiz',
  'Vargas',
  'Castillo',
  'Jiménez',
  'Mendoza',
  'Aguilar',
  'Herrera',
  'Medina',
  'Castro',
  'Vázquez',
  'Romero',
];

// Mexican street names
const CALLES = [
  'Av. Reforma',
  'Insurgentes Sur',
  'Insurgentes Norte',
  'Av. Juárez',
  'Paseo de la Reforma',
  'Av. Universidad',
  'Calle Hidalgo',
  'Av. Revolución',
  'Calle Morelos',
  'Av. Chapultepec',
  'Calle Independencia',
  'Av. Cuauhtémoc',
  'Calle Madero',
  'Av. Constituyentes',
  'Calle 5 de Mayo',
  'Av. División del Norte',
  'Calle Allende',
  'Av. Tlalpan',
  'Calle Guerrero',
  'Av. Patriotismo',
];

// Mexican colonias (neighborhoods)
const COLONIAS = [
  'Centro',
  'Roma Norte',
  'Roma Sur',
  'Condesa',
  'Polanco',
  'Del Valle',
  'Narvarte',
  'Coyoacán',
  'San Ángel',
  'Mixcoac',
  'Santa Fe',
  'Pedregal',
  'Satélite',
  'Lindavista',
  'Tepeyac',
];

// Mexican cities
const CIUDADES = [
  'Ciudad de México',
  'Guadalajara',
  'Monterrey',
  'Puebla',
  'Tijuana',
  'León',
  'Zapopan',
  'Querétaro',
  'Mérida',
  'San Luis Potosí',
];

// Loan descriptions
const DESCRIPCIONES_PRESTAMO = [
  'Préstamo personal',
  'Gastos médicos',
  'Reparación de casa',
  'Emergencia familiar',
  'Compra de electrodomésticos',
  'Gastos escolares',
  'Negocio',
  'Vehículo',
  'Viaje',
  'Deudas anteriores',
  null, // Some loans have no description
  null,
  null,
];

// Charge descriptions
const DESCRIPCIONES_CARGO = [
  'Cargo por mora',
  'Interés adicional',
  'Cargo administrativo',
  'Penalización',
  'Comisión por gestión',
  'Cargo por cobranza',
];

/**
 * Get a random element from an array
 */
function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random float between min and max with specified decimals
 */
function randomFloat(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * Generate a random date between two dates
 */
function randomDate(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(startTime + Math.random() * (endTime - startTime));
}

/**
 * Random boolean with optional probability (0-1)
 */
function randomBool(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Generate search terms from name and surname
 */
function generateSearchTerms(name: string, surname: string): string[] {
  const fullName = `${name} ${surname}`.toLowerCase();
  return [
    name.toLowerCase(),
    surname.toLowerCase(),
    fullName,
    fullName.replace(/[áéíóú]/g, (char) => {
      const map: Record<string, string> = {
        á: 'a',
        é: 'e',
        í: 'i',
        ó: 'o',
        ú: 'u',
      };
      return map[char] || char;
    }),
  ];
}

export const generators = {
  /**
   * Generate a random Spanish first name
   */
  nombre: () => random(NOMBRES),

  /**
   * Generate a random Spanish surname
   */
  apellido: () => random(APELLIDOS),

  /**
   * Generate a full Mexican address
   */
  direccion: () => {
    const calle = random(CALLES);
    const numero = randomInt(1, 500);
    const colonia = random(COLONIAS);
    const ciudad = random(CIUDADES);
    return `${calle} ${numero}, Col. ${colonia}, ${ciudad}`;
  },

  /**
   * Generate a Mexican phone number (10 digits)
   */
  telefono: () => {
    // Mexican phone format: area code (2-3 digits) + number
    const areaCodes = ['55', '33', '81', '222', '664', '477', '442', '999'];
    const areaCode = random(areaCodes);
    const remaining = 10 - areaCode.length;
    let number = '';
    for (let i = 0; i < remaining; i++) {
      number += randomInt(0, 9).toString();
    }
    return `${areaCode}${number}`;
  },

  /**
   * Generate a loan amount (typically 1,000 - 50,000 MXN)
   */
  montoPrestramo: (min: number = 1000, max: number = 50000) => {
    // Round to nearest 500
    const amount = randomInt(min, max);
    return Math.round(amount / 500) * 500;
  },

  /**
   * Generate weeks for a loan (typically 4-24 weeks)
   */
  semanas: () => random([4, 6, 8, 10, 12, 16, 20, 24]),

  /**
   * Calculate weekly payment based on amount and weeks (with interest)
   */
  pagoSemanal: (amount: number, weeks: number) => {
    // Add 20-40% interest
    const interestRate = randomFloat(0.2, 0.4);
    const totalWithInterest = amount * (1 + interestRate);
    return Math.ceil(totalWithInterest / weeks);
  },

  /**
   * Generate a loan description
   */
  descripcionPrestamo: () => random(DESCRIPCIONES_PRESTAMO),

  /**
   * Generate a charge description
   */
  descripcionCargo: () => random(DESCRIPCIONES_CARGO),

  /**
   * Generate a charge amount (typically 100 - 2000 MXN)
   */
  montoCargo: () => {
    const amount = randomInt(100, 2000);
    return Math.round(amount / 50) * 50;
  },

  /**
   * Generate a client ID (format: CLI-XXXX)
   */
  clientId: (index: number) => `CLI-${String(index).padStart(4, '0')}`,

  /**
   * Generate search terms for a client
   */
  searchTerms: generateSearchTerms,

  /**
   * Random date in the past (for created dates)
   */
  fechaPasada: (daysAgo: number = 365) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - daysAgo);
    return randomDate(start, end);
  },

  /**
   * Random future date (for expiration dates)
   */
  fechaFutura: (daysAhead: number = 180) => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + daysAhead);
    return randomDate(start, end);
  },

  /**
   * Calculate expired date based on start date and weeks
   */
  fechaVencimiento: (startDate: Date, weeks: number) => {
    const expiredDate = new Date(startDate);
    expiredDate.setDate(expiredDate.getDate() + weeks * 7);
    return expiredDate;
  },

  // Utility functions exposed
  random,
  randomInt,
  randomFloat,
  randomDate,
  randomBool,
};

export type Generators = typeof generators;

/**
 * Tipos compartidos para el filtro de período en resumen, historial y reportes.
 * Centralizados aquí para evitar duplicación entre store y componentes.
 */

export type Periodo = "semana" | "mes" | "año" | "personalizado";

export interface RangoFechas {
  inicio: Date | null;
  fin: Date | null;
}

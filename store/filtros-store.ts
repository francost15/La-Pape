import { create } from 'zustand';

export type Periodo = 'semana' | 'mes' | 'año' | 'personalizado';

export interface RangoFechas {
  inicio: Date | null;
  fin: Date | null;
}

interface FiltrosStore {
  periodo: Periodo;
  rangoPersonalizado: RangoFechas;
  setPeriodo: (periodo: Periodo) => void;
  setRangoPersonalizado: (rango: RangoFechas) => void;
}

export const useFiltrosStore = create<FiltrosStore>((set) => ({
  periodo: 'semana',
  rangoPersonalizado: { inicio: null, fin: null },

  setPeriodo: (periodo) => set({ periodo }),
  setRangoPersonalizado: (rangoPersonalizado) => set({ rangoPersonalizado }),
}));

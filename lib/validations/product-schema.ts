import { z } from 'zod';

export const createProductSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(80, 'El nombre no puede exceder 80 caracteres'),
  categoria_id: z.string().min(1, 'Debes seleccionar una categoría'),
  precio_venta: z.number().min(0.01, 'El precio de venta debe ser mayor a 0'),
  precio_mayoreo: z.number().min(0.01, 'El precio mayoreo debe ser mayor a 0'),
  costo_promedio: z.number().min(0, 'El costo promedio no puede ser negativo'),
  cantidad: z.number().int().min(0, 'La cantidad no puede ser negativa'),
  imagen: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  marca: z.string().max(50, 'La marca no puede exceder 50 caracteres').optional(),
  stock_minimo: z.number().int().min(0, 'El stock mínimo no puede ser negativo').optional(),
}).refine((data) => data.precio_mayoreo <= data.precio_venta, {
  message: 'El precio mayoreo debe ser menor o igual al precio de venta',
  path: ['precio_mayoreo'],
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;

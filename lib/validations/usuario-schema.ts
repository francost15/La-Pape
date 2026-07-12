import { z } from "zod";

/**
 * Alta de usuario del equipo. Antes se validaba a mano con 6 `if` + notify;
 * ahora RHF+Zod centraliza reglas y mensajes (mismo patrón que product-schema).
 */
export const crearUsuarioSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    email: z.string().trim().min(1, "El email es obligatorio").email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirma la contraseña"),
    telefono: z.string().optional(),
    rol: z.enum(["ADMIN", "VENDEDOR", "CAJERO"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type CrearUsuarioFormData = z.infer<typeof crearUsuarioSchema>;

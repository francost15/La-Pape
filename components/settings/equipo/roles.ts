import type { UserRole } from "@/interface";

// Config de roles compartida por RolBadge, MiembroRow y CrearUsuarioForm.
export const ROLES: UserRole[] = ["ADMIN", "VENDEDOR", "CAJERO"];

export const ROL_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  VENDEDOR: "Vendedor",
  CAJERO: "Cajero",
};

export const ROL_CLASSES: Record<
  UserRole,
  { bg: string; text: string; darkBg: string; darkText: string }
> = {
  ADMIN: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    darkBg: "dark:bg-orange-900/30",
    darkText: "dark:text-orange-400",
  },
  VENDEDOR: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    darkBg: "dark:bg-blue-900/30",
    darkText: "dark:text-blue-400",
  },
  CAJERO: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    darkBg: "dark:bg-neutral-700",
    darkText: "dark:text-gray-300",
  },
};

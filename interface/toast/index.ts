export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

export interface ToastStore {
  toasts: Toast[];
  push: (type: ToastType, title: string, description?: string) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

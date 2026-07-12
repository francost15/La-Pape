import type { ToastType } from "@/interface";
import { useToastStore } from "@/store/toast-store";

interface NotifyOptions {
  title: string;
  description?: string;
}

function fire(type: ToastType, opts: NotifyOptions) {
  useToastStore.getState().push(type, opts.title, opts.description);
}

export const notify = {
  success: (opts: NotifyOptions) => fire("success", opts),
  error: (opts: NotifyOptions) => fire("error", opts),
  warning: (opts: NotifyOptions) => fire("warning", opts),
  info: (opts: NotifyOptions) => fire("info", opts),
};

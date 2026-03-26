import { notify } from "@/lib/notify";

export function handleServiceError(error: unknown, context: string) {
  console.error(`${context}:`, error);
  notify.error({
    title: "Error",
    description: error instanceof Error ? error.message : String(error),
  });
}

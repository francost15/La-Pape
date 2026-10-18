export function logError(message: string, context?: Record<string, unknown>): void {
  console.error(message, context ?? "");
}

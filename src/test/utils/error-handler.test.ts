import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleServiceError } from "@/lib/utils/error-handler";
import * as notifyModule from "@/lib/notify";

vi.mock("@/lib/notify", () => ({
  notify: {
    error: vi.fn(),
  },
}));

describe("handleServiceError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("logs error with context to console.error", () => {
    const error = new Error("Test error");
    handleServiceError(error, "Test context");

    expect(console.error).toHaveBeenCalledWith("Test context:", error);
  });

  it("calls notify.error with title and description", () => {
    const error = new Error("Test error");
    handleServiceError(error, "Test context");

    expect(notifyModule.notify.error).toHaveBeenCalledWith({
      title: "Error",
      description: "Test error",
    });
  });

  it("handles non-Error objects", () => {
    const errorObj = { message: "Not an Error instance" };
    handleServiceError(errorObj, "Test context");

    expect(notifyModule.notify.error).toHaveBeenCalledWith({
      title: "Error",
      description: "[object Object]",
    });
  });

  it("handles string errors", () => {
    handleServiceError("String error", "Test context");

    expect(notifyModule.notify.error).toHaveBeenCalledWith({
      title: "Error",
      description: "String error",
    });
  });

  it("handles null and undefined errors", () => {
    handleServiceError(null, "Test context");
    expect(notifyModule.notify.error).toHaveBeenCalledWith({
      title: "Error",
      description: "null",
    });

    vi.clearAllMocks();
    handleServiceError(undefined, "Test context");
    expect(notifyModule.notify.error).toHaveBeenCalledWith({
      title: "Error",
      description: "undefined",
    });
  });
});

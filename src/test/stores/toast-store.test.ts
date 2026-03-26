import { describe, it, expect, beforeEach } from "vitest";
import { useToastStore } from "@/store/toast-store";

describe("ToastStore", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it("should have initial state with empty toasts", () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it("should push a toast", () => {
    useToastStore.getState().push("success", "Test Title", "Test description");

    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].type).toBe("success");
    expect(useToastStore.getState().toasts[0].title).toBe("Test Title");
    expect(useToastStore.getState().toasts[0].description).toBe("Test description");
  });

  it("should push toast without description", () => {
    useToastStore.getState().push("info", "Title Only");

    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].title).toBe("Title Only");
    expect(useToastStore.getState().toasts[0].description).toBeUndefined();
  });

  it("should dismiss a toast", () => {
    useToastStore.getState().push("success", "Test 1");
    useToastStore.getState().push("error", "Test 2");

    const toastId = useToastStore.getState().toasts[0].id;
    useToastStore.getState().dismiss(toastId);

    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].title).toBe("Test 2");
  });

  it("should clear all toasts", () => {
    useToastStore.getState().push("success", "Test 1");
    useToastStore.getState().push("error", "Test 2");

    useToastStore.getState().clear();

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("should accept all toast types", () => {
    useToastStore.getState().push("success", "Success toast");
    useToastStore.getState().push("error", "Error toast");
    useToastStore.getState().push("warning", "Warning toast");
    useToastStore.getState().push("info", "Info toast");

    expect(useToastStore.getState().toasts).toHaveLength(4);
    expect(useToastStore.getState().toasts[0].type).toBe("success");
    expect(useToastStore.getState().toasts[1].type).toBe("error");
    expect(useToastStore.getState().toasts[2].type).toBe("warning");
    expect(useToastStore.getState().toasts[3].type).toBe("info");
  });
});

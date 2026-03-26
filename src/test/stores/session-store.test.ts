import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSessionStore } from "@/store/session-store";

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}));

vi.mock("@/lib/services/usuarios", () => ({
  getUsuarioById: vi.fn().mockResolvedValue(null),
  getUsuarioByEmail: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/services/usuarios-negocios", () => ({
  getNegocioIdByUsuario: vi.fn().mockResolvedValue("negocio-123"),
}));

vi.mock("@/lib/services/sucursales", () => ({
  getSucursalesByNegocio: vi.fn().mockResolvedValue([{ id: "sucursal-1" }]),
}));

describe("SessionStore", () => {
  beforeEach(() => {
    useSessionStore.setState({
      userId: null,
      userEmail: null,
      displayName: null,
      photoURL: null,
      negocioId: null,
      sucursalId: null,
      ready: false,
      error: null,
    });
  });

  it("should have initial state", () => {
    const store = useSessionStore.getState();
    expect(store.userId).toBe(null);
    expect(store.userEmail).toBe(null);
    expect(store.displayName).toBe(null);
    expect(store.photoURL).toBe(null);
    expect(store.negocioId).toBe(null);
    expect(store.sucursalId).toBe(null);
    expect(store.ready).toBe(false);
    expect(store.error).toBe(null);
  });

  it("should clear state", () => {
    const store = useSessionStore.getState();
    store.clear();
    expect(store.userId).toBe(null);
    expect(store.ready).toBe(false);
    expect(store.error).toBe(null);
  });

  it("should hydrate with user data", async () => {
    const store = useSessionStore.getState();
    const mockUser = {
      uid: "user-123",
      email: "test@example.com",
      displayName: "Test User",
      photoURL: "https://example.com/photo.jpg",
    } as any;

    await store.hydrate(mockUser);

    const state = useSessionStore.getState();
    expect(state.userId).toBe("user-123");
    expect(state.userEmail).toBe("test@example.com");
    expect(state.displayName).toBe("Test User");
    expect(state.photoURL).toBe("https://example.com/photo.jpg");
    expect(state.negocioId).toBe("negocio-123");
    expect(state.sucursalId).toBe("sucursal-1");
    expect(state.ready).toBe(true);
  });

  it("should handle null displayName during hydrate", async () => {
    const store = useSessionStore.getState();
    const mockUser = {
      uid: "user-123",
      email: "test@example.com",
      displayName: null,
      photoURL: null,
    } as any;

    await store.hydrate(mockUser);

    const state = useSessionStore.getState();
    expect(state.displayName).toBe(null);
  });

  it("should set error when no negocio is assigned", async () => {
    const { getNegocioIdByUsuario } = await import("@/lib/services/usuarios-negocios");
    (getNegocioIdByUsuario as any).mockResolvedValueOnce(null);

    const store = useSessionStore.getState();
    const mockUser = {
      uid: "user-123",
      email: "test@example.com",
      displayName: "Test",
      photoURL: null,
    } as any;

    await store.hydrate(mockUser);

    const state = useSessionStore.getState();
    expect(state.error).toBe("No tienes un negocio asignado");
    expect(state.ready).toBe(true);
  });

  it("should handle errors during hydrate", async () => {
    const { getNegocioIdByUsuario } = await import("@/lib/services/usuarios-negocios");
    (getNegocioIdByUsuario as any).mockRejectedValueOnce(new Error("Network error"));

    const store = useSessionStore.getState();
    const mockUser = {
      uid: "user-123",
      email: "test@example.com",
      displayName: "Test",
      photoURL: null,
    } as any;

    await store.hydrate(mockUser);

    const state = useSessionStore.getState();
    expect(state.error).toBe("Error al cargar datos del negocio");
    expect(state.ready).toBe(true);
  });

  it("should continue without sucursal if getSucursalesByNegocio fails", async () => {
    const { getSucursalesByNegocio } = await import("@/lib/services/sucursales");
    (getSucursalesByNegocio as any).mockRejectedValueOnce(new Error("Failed"));

    const store = useSessionStore.getState();
    const mockUser = {
      uid: "user-123",
      email: "test@example.com",
      displayName: "Test",
      photoURL: null,
    } as any;

    await store.hydrate(mockUser);

    const state = useSessionStore.getState();
    expect(state.sucursalId).toBe(null);
    expect(state.ready).toBe(true);
  });
});

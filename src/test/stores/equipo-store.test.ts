import { describe, it, expect, beforeEach, vi } from "vitest";
import { useEquipoStore } from "@/store/equipo-store";

const mockGetUsuariosByNegocio = vi.fn();
const mockGetUsuarioById = vi.fn();
const mockGetUsuarioByEmail = vi.fn();
const mockUpdateUsuario = vi.fn();
const mockUpdateUsuarioNegocio = vi.fn();
const mockNotifyError = vi.fn();

vi.mock("@/lib/services/usuarios-negocios", () => ({
  getUsuariosByNegocio: (...args: any[]) => mockGetUsuariosByNegocio(...args),
  updateUsuarioNegocio: (...args: any[]) => mockUpdateUsuarioNegocio(...args),
}));

vi.mock("@/lib/services/usuarios", () => ({
  getUsuarioById: (...args: any[]) => mockGetUsuarioById(...args),
  getUsuarioByEmail: (...args: any[]) => mockGetUsuarioByEmail(...args),
  updateUsuario: (...args: any[]) => mockUpdateUsuario(...args),
}));

vi.mock("@/lib/notify", () => ({
  notify: {
    error: (...args: any[]) => mockNotifyError(...args),
  },
}));

describe("EquipoStore", () => {
  beforeEach(() => {
    useEquipoStore.setState({
      miembros: [],
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it("should have initial state", () => {
    const state = useEquipoStore.getState();
    expect(state.miembros).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  it("should clear state", () => {
    useEquipoStore.getState().clear();
    const state = useEquipoStore.getState();
    expect(state.miembros).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  it("should add miembro", () => {
    const miembro = {
      relacion: {
        id: "rel-1",
        usuario_id: "user-1",
        negocio_id: "n1",
        rol: "VENDEDOR",
        activo: true,
      },
      nombre: "Test User",
      email: "test@example.com",
      rol: "VENDEDOR" as const,
      inicial: "T",
    };
    useEquipoStore.getState().addMiembro(miembro);
    expect(useEquipoStore.getState().miembros).toHaveLength(1);
    expect(useEquipoStore.getState().miembros[0].nombre).toBe("Test User");
  });

  it("should sort miembros alphabetically when adding", () => {
    const miembro1 = {
      relacion: {
        id: "rel-1",
        usuario_id: "user-1",
        negocio_id: "n1",
        rol: "VENDEDOR",
        activo: true,
      },
      nombre: "Zack",
      email: "zack@example.com",
      rol: "VENDEDOR" as const,
      inicial: "Z",
    };
    const miembro2 = {
      relacion: {
        id: "rel-2",
        usuario_id: "user-2",
        negocio_id: "n1",
        rol: "VENDEDOR",
        activo: true,
      },
      nombre: "Alice",
      email: "alice@example.com",
      rol: "VENDEDOR" as const,
      inicial: "A",
    };
    useEquipoStore.getState().addMiembro(miembro1);
    useEquipoStore.getState().addMiembro(miembro2);

    const miembros = useEquipoStore.getState().miembros;
    expect(miembros[0].nombre).toBe("Alice");
    expect(miembros[1].nombre).toBe("Zack");
  });

  it("should load miembros when negocioId is null", async () => {
    await useEquipoStore.getState().loadMiembros(null);
    expect(useEquipoStore.getState().miembros).toEqual([]);
    expect(useEquipoStore.getState().loading).toBe(false);
  });

  it("should load miembros with user data", async () => {
    mockGetUsuariosByNegocio.mockResolvedValueOnce([
      { id: "rel-1", usuario_id: "user-1", negocio_id: "n1", rol: "VENDEDOR", activo: true },
    ]);
    mockGetUsuarioById.mockResolvedValueOnce({
      nombre: "John Doe",
      email: "john@example.com",
    });

    await useEquipoStore.getState().loadMiembros("n1");

    expect(useEquipoStore.getState().miembros).toHaveLength(1);
    expect(useEquipoStore.getState().miembros[0].nombre).toBe("John Doe");
    expect(useEquipoStore.getState().loading).toBe(false);
  });

  it("should handle load miembros error", async () => {
    mockGetUsuariosByNegocio.mockRejectedValueOnce(new Error("Network error"));

    await useEquipoStore.getState().loadMiembros("n1");

    expect(useEquipoStore.getState().error).toBe("No se pudieron cargar los miembros");
    expect(useEquipoStore.getState().loading).toBe(false);
    expect(mockNotifyError).toHaveBeenCalled();
  });

  it("should update rol", async () => {
    useEquipoStore.setState({
      miembros: [
        {
          relacion: {
            id: "rel-1",
            usuario_id: "user-1",
            negocio_id: "n1",
            rol: "VENDEDOR",
            activo: true,
          },
          nombre: "Test User",
          email: "test@example.com",
          rol: "VENDEDOR" as const,
          inicial: "T",
        },
      ],
    });

    await useEquipoStore.getState().updateRol("rel-1", "user-1", "test@example.com", "ADMIN");

    expect(useEquipoStore.getState().miembros[0].rol).toBe("ADMIN");
  });

  it("should remove miembro", async () => {
    useEquipoStore.setState({
      miembros: [
        {
          relacion: {
            id: "rel-1",
            usuario_id: "user-1",
            negocio_id: "n1",
            rol: "VENDEDOR",
            activo: true,
          },
          nombre: "Test User",
          email: "test@example.com",
          rol: "VENDEDOR" as const,
          inicial: "T",
        },
        {
          relacion: {
            id: "rel-2",
            usuario_id: "user-2",
            negocio_id: "n1",
            rol: "VENDEDOR",
            activo: true,
          },
          nombre: "Another User",
          email: "another@example.com",
          rol: "VENDEDOR" as const,
          inicial: "A",
        },
      ],
    });

    await useEquipoStore.getState().removeMiembro("rel-1");

    expect(useEquipoStore.getState().miembros).toHaveLength(1);
    expect(useEquipoStore.getState().miembros[0].nombre).toBe("Another User");
  });
});

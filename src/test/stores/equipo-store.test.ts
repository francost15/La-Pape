import type { MiembroConUsuario } from "@/interface/equipo";
import type { UsuarioNegocio } from "@/interface/usuarios-negocios";
import type { UserRole } from "@/interface/usuarios";
import { useEquipoStore } from "@/store/equipo-store";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCommit, mockBatchUpdate } = vi.hoisted(() => ({
  mockCommit: vi.fn().mockResolvedValue(undefined),
  mockBatchUpdate: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("@/lib/services/auditoria", () => ({ appendAudit: vi.fn() }));
vi.mock("@/store/session-store", () => ({
  useSessionStore: { getState: () => ({ userId: "admin-1" }) },
}));
vi.mock("firebase/firestore", () => ({
  writeBatch: () => ({ update: mockBatchUpdate, set: vi.fn(), commit: mockCommit }),
  doc: vi.fn(() => ({ id: "rel" })),
  collection: vi.fn(() => ({})),
}));

const mockGetUsuariosByNegocio = vi.fn();
const mockGetUsuarioById = vi.fn();
const mockGetUsuarioByEmail = vi.fn();
const mockUpdateUsuario = vi.fn();
const mockUpdateUsuarioNegocio = vi.fn();
const mockNotifyError = vi.fn();

vi.mock("@/lib/services/usuarios-negocios", () => ({
  getUsuariosByNegocio: (...args: unknown[]) => mockGetUsuariosByNegocio(...args),
  updateUsuarioNegocio: (...args: unknown[]) => mockUpdateUsuarioNegocio(...args),
}));

vi.mock("@/lib/services/usuarios", () => ({
  getUsuarioById: (...args: unknown[]) => mockGetUsuarioById(...args),
  getUsuarioByEmail: (...args: unknown[]) => mockGetUsuarioByEmail(...args),
  updateUsuario: (...args: unknown[]) => mockUpdateUsuario(...args),
}));

vi.mock("@/lib/notify", () => ({
  notify: {
    error: (...args: unknown[]) => mockNotifyError(...args),
  },
}));

function relacion(
  id: string,
  usuarioId = `user-${id}`,
  rol: UserRole = "VENDEDOR"
): UsuarioNegocio {
  return { id, usuario_id: usuarioId, negocio_id: "n1", rol, activo: true };
}

function miembro(id: string, nombre: string, rol: UserRole = "VENDEDOR"): MiembroConUsuario {
  return {
    relacion: relacion(id),
    nombre,
    email: `${nombre.toLowerCase()}@example.com`,
    rol,
    inicial: nombre[0] ?? "?",
  };
}

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
    useEquipoStore.setState({ miembros: [miembro("rel-1", "Test")], error: "fallo" });
    useEquipoStore.getState().clear();
    const state = useEquipoStore.getState();
    expect(state.miembros).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  it("should add miembro", () => {
    useEquipoStore.getState().addMiembro(miembro("rel-1", "Test User"));
    expect(useEquipoStore.getState().miembros).toHaveLength(1);
    expect(useEquipoStore.getState().miembros[0].nombre).toBe("Test User");
  });

  it("should sort miembros alphabetically when adding", () => {
    useEquipoStore.getState().addMiembro(miembro("rel-1", "Zack"));
    useEquipoStore.getState().addMiembro(miembro("rel-2", "Alice"));

    const miembros = useEquipoStore.getState().miembros;
    expect(miembros[0].nombre).toBe("Alice");
    expect(miembros[1].nombre).toBe("Zack");
  });

  it("should load miembros when negocioId is null", async () => {
    await useEquipoStore.getState().loadMiembros(null);
    expect(useEquipoStore.getState().miembros).toEqual([]);
    expect(useEquipoStore.getState().loading).toBe(false);
    expect(mockGetUsuariosByNegocio).not.toHaveBeenCalled();
  });

  it("toma el rol del usuario, no de la relación", async () => {
    mockGetUsuariosByNegocio.mockResolvedValueOnce([relacion("rel-1", "user-1", "CAJERO")]);
    mockGetUsuarioById.mockResolvedValueOnce({
      nombre: "John Doe",
      email: "john@example.com",
    });

    await useEquipoStore.getState().loadMiembros("n1");

    const [loaded] = useEquipoStore.getState().miembros;
    expect(loaded.nombre).toBe("John Doe");
    expect(loaded.rol).toBe("CAJERO");
    expect(loaded.inicial).toBe("J");
    expect(useEquipoStore.getState().loading).toBe(false);
  });

  it("usa VENDEDOR cuando el usuario no trae rol", async () => {
    mockGetUsuariosByNegocio.mockResolvedValueOnce([relacion("rel-1", "user-1")]);
    mockGetUsuarioById.mockResolvedValueOnce({
      nombre: "John Doe",
      email: "john@example.com",
    });

    await useEquipoStore.getState().loadMiembros("n1");

    expect(useEquipoStore.getState().miembros[0].rol).toBe("VENDEDOR");
  });

  it("should handle load miembros error", async () => {
    mockGetUsuariosByNegocio.mockRejectedValueOnce(new Error("Network error"));

    await useEquipoStore.getState().loadMiembros("n1");

    expect(useEquipoStore.getState().error).toBe("No se pudieron cargar los miembros");
    expect(useEquipoStore.getState().loading).toBe(false);
    expect(mockNotifyError).toHaveBeenCalled();
  });

  it("persiste el rol en la membresía y actualiza el miembro local", async () => {
    useEquipoStore.setState({ miembros: [miembro("rel-1", "Test User")] });

    await useEquipoStore.getState().updateRol("rel-1", "user-rel-1", "test@example.com", "ADMIN");

    expect(mockCommit).toHaveBeenCalled();
    expect(mockBatchUpdate).toHaveBeenCalled();
    expect(useEquipoStore.getState().miembros[0].rol).toBe("ADMIN");
  });

  it("no cambia el rol local si la escritura falla", async () => {
    useEquipoStore.setState({ miembros: [miembro("rel-1", "Test User")] });
    mockCommit.mockRejectedValueOnce(new Error("red"));

    await useEquipoStore.getState().updateRol("rel-1", "user-rel-1", "test@example.com", "ADMIN");

    expect(useEquipoStore.getState().miembros[0].rol).toBe("VENDEDOR");
    expect(mockNotifyError).toHaveBeenCalledWith({ title: "No se pudo cambiar el rol" });
  });

  it("desactiva la relación y quita al miembro", async () => {
    useEquipoStore.setState({
      miembros: [miembro("rel-1", "Test User"), miembro("rel-2", "Another User")],
    });
    mockCommit.mockResolvedValueOnce(undefined);

    await useEquipoStore.getState().removeMiembro("rel-1");

    expect(mockCommit).toHaveBeenCalled();
    expect(useEquipoStore.getState().miembros).toHaveLength(1);
    expect(useEquipoStore.getState().miembros[0].nombre).toBe("Another User");
  });

  it("conserva al miembro si no se pudo desactivar", async () => {
    useEquipoStore.setState({ miembros: [miembro("rel-1", "Test User")] });
    mockCommit.mockRejectedValueOnce(new Error("red"));

    await useEquipoStore.getState().removeMiembro("rel-1");

    expect(useEquipoStore.getState().miembros).toHaveLength(1);
    expect(mockNotifyError).toHaveBeenCalledWith({ title: "No se pudo quitar al miembro" });
  });
});

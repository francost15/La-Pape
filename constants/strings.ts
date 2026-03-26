export const Strings = {
  auth: {
    loginTitle: "Iniciar sesión",
    registerTitle: "Crear cuenta",
    emailPlaceholder: "Correo electrónico",
    passwordPlaceholder: "Contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    noAccount: "¿No tienes cuenta?",
    hasAccount: "¿Ya tienes cuenta?",
    signInWithGoogle: "Continuar con Google",
  },

  ventas: {
    emptyCart: "Carrito vacío",
    emptyCartHint: "Agrega productos desde el panel lateral",
    completeSale: "Completar venta",
    clearCart: "Limpiar",
    confirmComplete: "¿Estás seguro de completar esta venta?",
    confirmClear: "¿Estás seguro de vaciar el carrito?",
    cartEmptied: "Carrito vaciado",
    saleCompleted: "Venta completada",
    errorRegisteringSale: "Error al registrar la venta",
    removeFromCart: "Eliminar del carrito",
    clearCartTitle: "Vaciar carrito",
    accept: "Aceptar",
  },

  productos: {
    emptyProducts: "No hay productos",
    emptyProductsAvailable: "No hay productos disponibles",
    emptyProductsHint: "Agrega productos desde el panel lateral",
    createFirstProduct: "Crear primer producto",
    noSearchResults: "No se encontraron productos con esa búsqueda",
    loadMore: "Cargar más",
    retry: "Reintentar",
  },

  history: {
    emptySales: "No hay ventas en este período",
    emptySalesHint:
      "Ajusta el filtro de fechas o registra nuevas ventas para ver el historial aquí",
    loadingHistory: "Cargando historial...",
    loadHistory: "No se pudo cargar el historial de ventas",
    noNegocioAssigned: "No tienes un negocio asignado",
    noSaleDetails: "Sin detalles para esta venta",
    couldNotGenerateReceipt: "No se pudo generar el recibo",
    refundConfirm: "Confirmar reembolso",
    processingRefund: "Procesando...",
    refund: "Reembolsar",
    refundSuccess: "Reembolso procesado correctamente",
    refundError: "No se pudo procesar el reembolso",
    verifyConnection: "Verifica tu conexión e intenta nuevamente",
  },

  common: {
    loading: "Cargando...",
    error: "Error",
    retry: "Reintentar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    delete: "Eliminar",
    save: "Guardar",
    search: "Buscar...",
    noResults: "Sin resultados",
    empty: "Vaciar",
  },

  errors: {
    connection: "Verifica tu conexión e intenta nuevamente",
    session: "No se pudo completar: sesión incompleta",
    generic: "Algo salió mal",
  },
} as const;

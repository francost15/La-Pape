export class AppError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = this.constructor.name;
    // Error.captureStackTrace is V8 specific, so check if it exists (good for React Native / web compat)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class InsufficientStockError extends AppError {
  constructor(productName: string, currentStock: number) {
    super(`Stock insuficiente para "${productName}" (${currentStock} disponible)`, 'INSUFFICIENT_STOCK');
  }
}

export class ProductNotFoundError extends AppError {
  constructor(productId: string) {
    super(`Producto no encontrado: ${productId}`, 'PRODUCT_NOT_FOUND');
  }
}

export class InvalidQuantityError extends AppError {
  constructor(productName: string) {
    super(`Cantidad inválida para ${productName}`, 'INVALID_QUANTITY');
  }
}

export class VentaError extends AppError {
  constructor(message: string) {
    super(message, 'VENTA_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado/a`, 'NOT_FOUND');
  }
}

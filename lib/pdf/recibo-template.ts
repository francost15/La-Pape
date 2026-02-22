export interface ReciboData {
  ventaId: string;
  fecha: Date;
  items: {
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    totalLinea: number;
  }[];
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: string;
  negocioNombre?: string;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(id: string): string {
  return id.slice(-6).toUpperCase();
}

export function buildReciboHTML(data: ReciboData, logoBase64: string): string {
  const negocio = data.negocioNombre ?? "La Pape";

  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;font-size:13px;color:#1a1a1a;border-bottom:1px solid #ddd;font-family:Arial,Helvetica,sans-serif;">
          ${item.nombre}
        </td>
        <td style="padding:10px 8px;font-size:13px;color:#444;text-align:center;border-bottom:1px solid #ddd;font-family:Arial,Helvetica,sans-serif;">
          ${item.cantidad}
        </td>
        <td style="padding:10px 8px;font-size:13px;color:#444;text-align:right;border-bottom:1px solid #ddd;font-family:Arial,Helvetica,sans-serif;">
          ${formatCurrency(item.precioUnitario)}
        </td>
        <td style="padding:10px 12px;font-size:13px;color:#1a1a1a;text-align:right;font-weight:bold;border-bottom:1px solid #ddd;font-family:Arial,Helvetica,sans-serif;">
          ${formatCurrency(item.totalLinea)}
        </td>
      </tr>`,
    )
    .join("");

  const descuentoRow =
    data.descuento > 0
      ? `
      <tr>
        <td colspan="3" style="padding:6px 12px;font-size:13px;color:#666;text-align:right;font-family:Arial,Helvetica,sans-serif;">Descuento</td>
        <td style="padding:6px 12px;font-size:13px;color:#dc2626;text-align:right;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">
          -${formatCurrency(data.descuento)}
        </td>
      </tr>`
      : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Factura ${shortId(data.ventaId)}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }
    @media print {
      html, body { background: #fff !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#fff;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#fff;">

          <!-- Header: Logo + FACTURA -->
          <tr>
            <td style="padding-bottom:36px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="80" style="vertical-align:middle;">
                    <img src="${logoBase64}" alt="" width="60" style="display:block;" role="img" />
                  </td>
                  <td style="vertical-align:middle;text-align:right;">
                    <span style="font-size:28px;letter-spacing:6px;color:#1a1a1a;">FACTURA</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info: Negocio + Nro Factura -->
          <tr>
            <td style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="55%" style="vertical-align:top;">
                    <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;font-family:Arial,Helvetica,sans-serif;">
                      ${negocio}
                    </div>
                    <div style="font-size:13px;color:#555;font-family:Arial,Helvetica,sans-serif;">
                      Papelería &amp; Suministros
                    </div>
                  </td>
                  <td style="vertical-align:top;text-align:right;font-family:Arial,Helvetica,sans-serif;">
                    <div style="font-size:13px;color:#444;line-height:22px;">
                      Factura n.º <strong style="color:#1a1a1a;">${shortId(data.ventaId)}</strong>
                    </div>
                    <div style="font-size:13px;color:#444;line-height:22px;">
                      ${formatDate(data.fecha)}
                    </div>
                    <div style="font-size:13px;color:#444;line-height:22px;">
                      ${formatTime(data.fecha)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Separador grueso -->
          <tr>
            <td style="border-top:2px solid #1a1a1a;padding-bottom:20px;"></td>
          </tr>

          <!-- Tabla de productos -->
          <tr>
            <td style="padding-bottom:4px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="padding:8px 12px;font-size:11px;color:#888;text-align:left;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1a1a1a;font-weight:normal;font-family:Arial,Helvetica,sans-serif;">
                      Artículo
                    </th>
                    <th style="padding:8px 8px;font-size:11px;color:#888;text-align:center;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1a1a1a;font-weight:normal;font-family:Arial,Helvetica,sans-serif;">
                      Cant.
                    </th>
                    <th style="padding:8px 8px;font-size:11px;color:#888;text-align:right;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1a1a1a;font-weight:normal;font-family:Arial,Helvetica,sans-serif;">
                      P. Unitario
                    </th>
                    <th style="padding:8px 12px;font-size:11px;color:#888;text-align:right;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #1a1a1a;font-weight:normal;font-family:Arial,Helvetica,sans-serif;">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totales -->
          <tr>
            <td style="padding-bottom:36px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:6px 12px;font-size:14px;color:#666;text-align:right;font-family:Arial,Helvetica,sans-serif;" colspan="3">
                    Subtotal
                  </td>
                  <td style="padding:6px 12px;font-size:14px;color:#1a1a1a;text-align:right;font-family:Arial,Helvetica,sans-serif;" width="100">
                    ${formatCurrency(data.subtotal)}
                  </td>
                </tr>
                ${descuentoRow}
                <tr>
                  <td style="padding:14px 12px 6px;font-size:20px;font-weight:bold;color:#1a1a1a;text-align:right;font-family:Arial,Helvetica,sans-serif;" colspan="3">
                    Total
                  </td>
                  <td style="padding:14px 12px 6px;font-size:20px;font-weight:bold;color:#1a1a1a;text-align:right;font-family:Arial,Helvetica,sans-serif;" width="100">
                    ${formatCurrency(data.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gracias -->
          <tr>
            <td style="padding-bottom:36px;">
              <span style="font-size:24px;color:#1a1a1a;">¡Muchas gracias!</span>
            </td>
          </tr>

          <!-- Separador fino -->
          <tr>
            <td style="border-top:1px solid #ccc;padding-bottom:20px;"></td>
          </tr>

          <!-- Footer: Pago + Negocio -->
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="55%" style="vertical-align:top;">
                    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">
                      Información de pago
                    </div>
                    <div style="font-size:12px;color:#555;line-height:20px;font-family:Arial,Helvetica,sans-serif;">
                      Método: <strong>${data.metodoPago}</strong>
                    </div>
                    <div style="font-size:12px;color:#555;line-height:20px;font-family:Arial,Helvetica,sans-serif;">
                      Estado: <strong>Pagada</strong>
                    </div>
                  </td>
                  <td style="vertical-align:top;text-align:right;">
                    <div style="font-size:18px;color:#1a1a1a;margin-bottom:4px;">
                      ${negocio}
                    </div>
                    <div style="font-size:11px;color:#888;font-family:Arial,Helvetica,sans-serif;">
                      Comprobante de venta
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

import type { LineaVentaDisplay } from "@/interface/shared";

export interface ReciboData {
  ventaId: string;
  fecha: Date;
  items: LineaVentaDisplay[];
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

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Factura ${shortId(data.ventaId)}</title>
  <style>
    /* Sin @import remoto: el recibo se genera/imprime a menudo sin red,
       así que dependemos solo de fuentes del sistema para que nunca falle. */
    @page {
      size: A4;
      margin: 0; /* Remove browser headers and footers */
    }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111827;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    @media print {
      html, body { background: #ffffff !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    .container {
      padding: 40mm 20mm; /* Emulate page margins safely */
      max-width: 800px;
      margin: 0 auto;
    }
    .logo-container {
      padding: 4px 0;
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
    }
    .logo {
      display: block;
      height: 48px;
      width: auto;
      max-width: 200px;
    }
    .header-title {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #111827;
      text-transform: uppercase;
    }
    .business-name {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #111827;
      margin-bottom: 2px;
    }
    .business-type {
      font-size: 12px;
      color: #6B7280;
    }
    .invoice-details {
      font-size: 13px;
      color: #4B5563;
      line-height: 1.8;
      text-align: right;
    }
    .invoice-details strong {
      color: #111827;
      font-weight: 600;
    }
    .table-container {
      width: 100%;
      border-collapse: collapse;
      margin-top: 40px;
      margin-bottom: 40px;
    }
    .table-container th {
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 600;
      color: #6B7280;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      border-bottom: 2px solid #111827;
    }
    .table-container th.center { text-align: center; }
    .table-container th.right { text-align: right; }
    .table-container td {
      padding: 16px;
      font-size: 13px;
      color: #111827;
      border-bottom: 1px solid #E5E7EB;
    }
    .table-container td.center { text-align: center; color: #4B5563; }
    .table-container td.right { text-align: right; color: #4B5563; }
    .table-container td.total-col {
      text-align: right;
      font-weight: 600;
      color: #111827;
    }
    .summary-box {
      width: 100%;
      border-collapse: collapse;
    }
    .summary-box td {
      padding: 8px 16px;
      font-size: 14px;
      color: #4B5563;
      text-align: right;
    }
    .summary-box td.label { width: 100%; }
    .summary-box td.value { width: 120px; white-space: nowrap; color: #111827; }
    .summary-box tr.grand-total td {
      padding: 24px 16px 8px;
      font-size: 24px;
      font-weight: 700;
      color: #111827;
    }
    .footer-divider {
      border-top: 1px solid #E5E7EB;
      margin: 40px 0 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <!-- Header: Logo + FACTURA -->
      <tr>
        <td style="padding-bottom: 48px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="50%" style="vertical-align:middle;">
                <img src="${logoBase64}" alt="La Pape" style="display:block;height:52px;width:52px;border-radius:12px;" />
              </td>
              <td width="50%" style="vertical-align:middle;text-align:right;">
                <span class="header-title">FACTURA</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Info: Negocio + Nro Factura -->
      <tr>
        <td style="padding-bottom: 8px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="50%" style="vertical-align:top;">
                <div class="business-name">${negocio}</div>
                <div class="business-type">Papelería &amp; Suministros</div>
              </td>
              <td width="50%" style="vertical-align:top;" class="invoice-details">
                <div>Comprobante n.º <strong>${shortId(data.ventaId)}</strong></div>
                <div>${formatDate(data.fecha)}</div>
                <div>${formatTime(data.fecha)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Tabla de productos -->
      <tr>
        <td>
          <table class="table-container">
            <thead>
              <tr>
                <th>Artículo</th>
                <th class="center">Cant.</th>
                <th class="right">P. Unitario</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.items
                .map(
                  (item) => `
              <tr>
                <td>${item.nombre}</td>
                <td class="center">${item.cantidad}</td>
                <td class="right">${formatCurrency(item.precioUnitario)}</td>
                <td class="total-col">${formatCurrency(item.totalLinea)}</td>
              </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </td>
      </tr>

      <!-- Totales -->
      <tr>
        <td>
          <table class="summary-box">
            <tr>
              <td class="label">Subtotal</td>
              <td class="value">${formatCurrency(data.subtotal)}</td>
            </tr>
            ${
              data.descuento > 0
                ? `
            <tr>
              <td class="label">Descuento</td>
              <td class="value" style="color: #DC2626;">-${formatCurrency(data.descuento)}</td>
            </tr>`
                : ""
            }
            <tr class="grand-total">
              <td class="label">TOTAL</td>
              <td class="value">${formatCurrency(data.total)}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td>
          <div class="footer-divider"></div>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="50%" style="vertical-align:top;">
                <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:600;">
                  Detalles de pago
                </div>
                <div style="font-size:13px;color:#111827;line-height:20px;">
                  Método de pago: <strong>${data.metodoPago}</strong>
                </div>
                <div style="font-size:13px;color:#111827;line-height:20px;">
                  Estado: <strong>Completada</strong>
                </div>
              </td>
              <td width="50%" style="vertical-align:bottom;text-align:right;">
                <div style="font-size:24px;font-weight:600;color:#111827;margin-bottom:4px;letter-spacing:-0.5px;">
                  ¡Gracias por su compra!
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

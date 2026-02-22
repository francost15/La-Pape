import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { LOGO_BASE64 } from "./logo";
import { buildReciboHTML, type ReciboData } from "./recibo-template";

function printOnWeb(html: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  let printed = false;

  const doPrint = () => {
    if (printed) return;
    printed = true;
    printWindow.focus();
    printWindow.print();
  };

  printWindow.onload = doPrint;
  setTimeout(doPrint, 600);
}

export async function generateAndShareRecibo(
  data: ReciboData,
): Promise<void> {
  const html = buildReciboHTML(data, LOGO_BASE64);

  if (Platform.OS === "web") {
    printOnWeb(html);
    return;
  }

  const Print = await import("expo-print");
  const { uri } = await Print.printToFileAsync({ html });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: "Recibo de venta",
    });
  }
}

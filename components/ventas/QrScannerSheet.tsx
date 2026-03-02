import { IconSymbol } from "@/components/ui/icon-symbol";
import { notify } from "@/lib/notify";
import { getProductById } from "@/lib/services/productos";
import { useSessionStore } from "@/store/session-store";
import { useVentasStore } from "@/store/ventas-store";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { useHaptic } from "@/hooks/use-haptic";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface QrScannerSheetProps {
  visible: boolean;
  onClose: () => void;
  onProductAdded?: (productName: string) => void;
}

/**
 * Modal que muestra la cámara para escanear códigos QR de productos.
 * El QR debe contener el product.id (string).
 * Al escanear, busca el producto y lo agrega al carrito.
 */
export default function QrScannerSheet({
  visible,
  onClose,
  onProductAdded,
}: QrScannerSheetProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const addItem = useVentasStore((s) => s.addItem);
  const negocioId = useSessionStore((s) => s.negocioId);
  const haptic = useHaptic();
  const hapticMedium = useHaptic(Haptics.ImpactFeedbackStyle.Medium);
  const scannedRef = useRef(false);

  useEffect(() => {
    if (!visible) scannedRef.current = false;
  }, [visible]);

  const handleBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (scannedRef.current) return;
      const productId = data?.trim();
      if (!productId) return;

      scannedRef.current = true;
      hapticMedium();

      try {
        const product = await getProductById(productId);
        if (!product) {
          notify.error({
            title: "Producto no encontrado",
            description: "El código QR no corresponde a un producto válido",
          });
          scannedRef.current = false;
          return;
        }

        if (negocioId && product.negocio_id !== negocioId) {
          notify.error({
            title: "Producto no disponible",
            description: "Este producto no pertenece a tu negocio",
          });
          scannedRef.current = false;
          return;
        }

        if (!product.activo) {
          notify.error({
            title: "Producto inactivo",
            description: "Este producto ya no está disponible",
          });
          scannedRef.current = false;
          return;
        }

        addItem(product, 1);
        onProductAdded?.(product.nombre);
        notify.success({ title: `${product.nombre} agregado` });
        onClose();
      } catch {
        notify.error({
          title: "Error",
          description: "No se pudo agregar el producto",
        });
      } finally {
        scannedRef.current = false;
      }
    },
    [addItem, hapticMedium, negocioId, onClose, onProductAdded],
  );

  const handleClose = useCallback(() => {
    haptic();
    onClose();
  }, [haptic, onClose]);

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ea580c" />
          <Text style={styles.message}>Verificando permisos...</Text>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible transparent animationType="slide">
        <View style={styles.centered}>
          <Text style={styles.message}>
            La Pape necesita acceso a la cámara para escanear códigos QR
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Permitir cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
        <View style={styles.overlay}>
          <Text style={styles.title}>Escanear código QR</Text>
          <Text style={styles.subtitle}>
            Apunta la cámara al QR del producto
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <IconSymbol name="xmark" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  message: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: "#ea580c",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: "#9ca3af",
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});

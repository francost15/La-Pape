import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AppColors } from "@/constants/colors";
import { IconSymbol } from "./icon-symbol";
import type { ErrorBoundaryProps, ErrorBoundaryState } from "@/interface/ui";

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center bg-canvas p-8">
          <View className="max-w-sm items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-error/10">
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={32}
                color={AppColors.errorLight}
              />
            </View>
            <Text className="text-center text-xl font-bold text-content-primary">
              Algo salió mal
            </Text>
            <Text className="text-center text-sm text-content-secondary">
              {__DEV__
                ? this.state.error?.message
                : "Encontramos un problema. Por favor intenta de nuevo."}
            </Text>
            <TouchableOpacity
              className="mt-2 rounded-xl bg-accent px-6 py-3"
              onPress={this.reset}
            >
              <Text className="font-semibold text-white">Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

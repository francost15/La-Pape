import React, { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { IconSymbol } from "./icon-symbol";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
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
        <View className="flex-1 items-center justify-center bg-gray-50 p-8 dark:bg-neutral-900">
          <View className="max-w-sm items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <IconSymbol name="exclamationmark.triangle.fill" size={32} color="#ef4444" />
            </View>
            <Text className="text-center text-xl font-bold text-gray-900 dark:text-white">
              Algo salió mal
            </Text>
            <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
              {__DEV__
                ? this.state.error?.message
                : "Encontramos un problema. Por favor intenta de nuevo."}
            </Text>
            <TouchableOpacity
              className="mt-2 rounded-xl bg-orange-500 px-6 py-3"
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

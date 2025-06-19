import * as React from "react";
import Toast, { ToastShowParams } from "react-native-toast-message";

export type ToastProps = Partial<ToastShowParams> & {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
};

export const useToast = () => {
  const toast = React.useCallback(
    ({ title, description, variant = "default", action, ...props }: ToastProps) => {
      const type = variant === "destructive" ? "error" : "success";
      
      Toast.show({
        type,
        text1: title,
        text2: description,
        position: "bottom",
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 40,
        bottomOffset: 40,
        ...props,
      });
    },
    []
  );

  return {
    toast,
    dismiss: () => Toast.hide(),
  };
};

// Component to include at the root of your app
// Create a functional component that renders the Toast
export function ToastProvider(): React.ReactElement {
  // Using a workaround to avoid the namespace vs component type conflict
  const ToastComponent = Toast as unknown as React.ComponentType<{}>;
  return React.createElement(ToastComponent);
}

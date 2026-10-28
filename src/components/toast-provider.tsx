
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import styles from "./toast-provider.module.scss";

type ToastType = "success" | "error" | "info";

type ToastMessage = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={styles.toast}
      role={toast.type === "error" ? "alert" : "status"}
      aria-atomic="true"
      data-type={toast.type}
    >
      <span aria-hidden="true" className={styles.icon} />
      <p>{toast.message}</p>

      <button
        className={styles.dismiss}
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = crypto.randomUUID();

      setToasts((currentToasts) => [
        ...currentToasts,
        { id, message, type },
      ]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div aria-label="Notifications" className={styles.container} data-toast-container>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}

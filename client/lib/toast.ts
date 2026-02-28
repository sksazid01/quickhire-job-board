type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) {
    listener([...toasts]);
  }
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Toast[] {
  return toasts;
}

export function toast(message: string, variant: ToastVariant = "info") {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, variant }];
  notify();
  setTimeout(() => dismiss(id), 4000);
}

export function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export const success = (message: string) => toast(message, "success");
export const error = (message: string) => toast(message, "error");

type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeToXpUpdates(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function notifyXpUpdated() {
  listeners.forEach((listener) => {
    listener();
  });
}

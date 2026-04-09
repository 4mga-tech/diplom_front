import { useState } from "react";

export type Notification = {
  id: string;
  message: string;
  type: string;
  createdAt: number;
  read: boolean;
};

let listeners: any[] = [];
let data: Notification[] = [
  {
    id: "1",
    message: "New lesson available!",
    type: "lesson",
    createdAt: Date.now(),
    read: false,
  },
  {
    id: "2",
    message: "Daily streak achieved!",
    type: "streak",
    createdAt: Date.now(),
    read: false,
  },
  {
    id: "3",
    message: "New course unlocked!",
    type: "course",
    createdAt: Date.now(),
    read: true,
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState(data);

  const subscribe = () => {
    listeners.push(setNotifications);
    return () => {
      listeners = listeners.filter((l) => l !== setNotifications);
    };
  };

  const notify = () => {
    listeners.forEach((l) => l([...data]));
  };

  const addNotification = (n: Notification) => {
    data = [n, ...data];
    notify();
  };

  const markAllRead = () => {
    data = data.map((n) => ({ ...n, read: true }));
    notify();
  };

  const remove = (id: string) => {
    data = data.filter((n) => n.id !== id);
    notify();
  };

  return {
    notifications,
    subscribe,
    addNotification,
    markAllRead,
    remove,
  };
}

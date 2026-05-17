import { create } from "zustand";

export interface NotificationItem {
  id: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationState {
  notifications: NotificationItem[];
  push: (message: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    { id: "n1", message: "Cycle 7 standings are live", createdAt: new Date(), read: false },
    { id: "n2", message: "Your next match is ready for submission", createdAt: new Date(), read: false }
  ],
  push: (message) =>
    set((state) => ({
      notifications: [
        { id: crypto.randomUUID(), message, createdAt: new Date(), read: false },
        ...state.notifications
      ]
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, read: true }))
    }))
}));

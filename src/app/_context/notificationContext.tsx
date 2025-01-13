"use client";

import { createContext, useState, type ReactNode } from "react";

type NotificationType = {
  type: "success" | "error" | "info";
  text: string;
  isVisible: boolean;
};

type NotificationContextType = {
  notification: NotificationType;
  setNotification: React.Dispatch<React.SetStateAction<NotificationType>>;
};

export const NotificationContext = createContext<NotificationContextType>({
  notification: { type: "info", text: "", isVisible: false },
  setNotification: () => null,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationType>({
    type: "info",
    text: "",
    isVisible: false,
  });

  return (
    <NotificationContext.Provider value={{ notification, setNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

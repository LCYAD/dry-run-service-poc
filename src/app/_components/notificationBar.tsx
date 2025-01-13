"use client";

import { useEffect, useContext } from "react";
import { NotificationContext } from "@/app/_context/notificationContext";

export default function NotificationBar() {
  const { notification, setNotification } = useContext(NotificationContext);

  useEffect(() => {
    if (notification.isVisible) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, isVisible: false }));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification.isVisible, setNotification]);

  const alertColorClassName =
    notification.type === "success"
      ? "alert-success"
      : notification.type === "error"
        ? "alert-error"
        : "alert-info";

  const className = `alert ${alertColorClassName} w-[500px] transition-opacity duration-[2000ms] font-bold ${
    notification.isVisible ? "opacity-100" : "opacity-0"
  }`;

  return (
    <div role="alert" className={className}>
      <span>{notification.text}</span>
    </div>
  );
}

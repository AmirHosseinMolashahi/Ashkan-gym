import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/GlobalComponents/Notification/Notification';
import styles from '../components/GlobalComponents/Notification/Notification.module.scss';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((text, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random(); // شناسه یکتا
    const newNotif = { id, text, type, duration };

    setNotifications((prev) => [...prev, newNotif]);

    // حذف خودکار
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  const handleClose = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className={styles.notificationWrapper}>
        {notifications.map((n) => (
          <Notification
            key={n.id}
            message={n.text}
            type={n.type}
            duration={n.duration}
            onClose={() => handleClose(n.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

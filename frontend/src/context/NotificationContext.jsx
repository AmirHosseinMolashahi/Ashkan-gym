// ToastNotificationContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/GlobalComponents/Notification/Notification';
import styles from '../components/GlobalComponents/Notification/Notification.module.scss';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((text, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();

    setToasts(prev => [...prev, { id, text, type, duration }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const handleClose = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className={styles.notificationWrapper}>
        {toasts.map(t => (
          <Notification
            key={t.id}
            message={t.text}
            type={t.type}
            duration={t.duration}
            onClose={() => handleClose(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

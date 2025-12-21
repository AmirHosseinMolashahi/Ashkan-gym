import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import Notification from '../components/GlobalComponents/Notification/Notification';
import styles from '../components/GlobalComponents/Notification/Notification.module.scss';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth()

  const wsRef = useRef(null)

  useEffect(() => {
    if (!user) return;

    const socket = new WebSocket("ws://localhost:8000/ws/notifications/");
    console.log(socket)
    wsRef.current = socket; 
    
    const connectSocket = () => {
      socket.onopen = () => {
        console.log("🔗 WebSocket connected");
      };

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        notify(data.title, data.type ?? "info");
      };

      socket.onclose = () => {
        console.log("❌ WebSocket closed");
        setTimeout(() => connectSocket(), 2000);
      };
    };

    connectSocket();

    return () => {
      if (wsRef.current) {
        console.log(wsRef.current)
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user]);



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

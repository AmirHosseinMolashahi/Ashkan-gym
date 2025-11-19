import React, { useEffect, useState } from 'react';
import styles from './Notification.module.scss';
import clsx from 'clsx';

const Notification = ({ message, type = 'info', onClose, duration = 3000 }) => {
  const [closing, setClosing] = useState()
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true);
      setTimeout(onClose, 300); // صبر کن انیمیشن تمام بشه بعد حذف کن
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleManualClose = () => {
    setClosing(true);
    setTimeout(onClose, 300);
  };

  if (!message) return null;

  return (
    <div className={clsx(styles.notification, styles[type], {[styles.closing]: closing})}>
      <span className={styles.closeBtn} onClick={handleManualClose}>×</span>
      {message}
    </div>
  );
};

export default Notification;

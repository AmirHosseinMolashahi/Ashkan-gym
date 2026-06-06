import styles from './NotificationsDropdown.module.scss';
import { useSelector, useDispatch } from "react-redux";
import { selectUnreadNotifications, selectUnreadCount, markAllAsRead, markNotificationAsRead } from '../../../store/notificationSlice';
import { UilAngleLeft } from '@iconscout/react-unicons';
import { useNavigate } from 'react-router-dom';

export default function NotificationsDropdown({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const NotifList = useSelector(selectUnreadNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <button className={styles.readAll} onClick={() => dispatch(markAllAsRead())}>
          خواندن همه
        </button>
        <div className={styles.headerRight}>
          <span className={styles.title}>اعلان‌ها</span>
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount} جدید</span>
          )}
        </div>
      </div>

      <div className={styles.list}>
        {NotifList.map((n, i) => (
          <div
            key={n.id}
            className={`${styles.item} ${!n.is_read ? styles.unread : ''}`}
            style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => dispatch(markNotificationAsRead(n.id))}
          >
            {!n.is_read && <span className={styles.dot} />}
            <div className={styles.content}>
              <span className={styles.itemTitle}>{n.title}</span>
              <span className={styles.desc}>{n.message}</span>
              <span className={styles.time}>🕐 {n.created_at_jalali}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer} onClick={() => {navigate('/dashboard/notifications/'); onClose();}}>
        <span>مشاهده همه اعلان‌ها</span>
        <UilAngleLeft />
      </div>
    </div>
  );
}
import React from 'react';
import { UilTrashAlt, UilCheckCircle } from '@iconscout/react-unicons';
import { timeAgo, NotifCategory } from './notifCard.utils.jsx';
import style from './NotifCard.desktop.module.scss';

const NotifCardDesktop = ({ item, handleDelete, handleRead }) => {
  return (
    <div
      className={`${style.notifCard} ${!item.is_read ? style.unread : style.read}`}
    >
      <div className={style.notifCardWrapper}>

        {/* آیکون دسته‌بندی */}
        <div className={style.notifIcon}>
          <span className={`${style.notifIconWrapper} ${style[item.category]}`}>
            {NotifCategory[item.category] ?? item.category}
          </span>
        </div>

        {/* عنوان و پیام */}
        <div className={style.notifInfo}>
          <strong>{item.title}</strong>
          <p>{item.message}</p>
        </div>

        {/* زمان */}
        <div className={style.notifTime}>
          <p>{timeAgo(item.created_at)}</p>
        </div>

        {/* اکشن‌ها — فقط دسکتاپ */}
        <div className={style.notifAction}>
          {!item.is_read && (
            <span className={style.readNotif}>
              <UilCheckCircle onClick={() => handleRead(item)} />
            </span>
          )}
          <span className={style.deleteNotif}>
            <UilTrashAlt onClick={() => handleDelete(item)} />
          </span>
        </div>

      </div>

      {!item.is_read && <span className={style.newNotifDot} />}
    </div>
  );
};

export default NotifCardDesktop;

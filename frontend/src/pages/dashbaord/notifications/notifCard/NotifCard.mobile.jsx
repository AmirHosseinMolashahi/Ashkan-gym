import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { UilTrashAlt, UilCheckCircle } from '@iconscout/react-unicons';
import { timeAgo, NotifCategory } from './notifCard.utils';
import style from './NotifCard.mobile.module.scss';

const SWIPE_READ_THRESHOLD = -80;    // چپ → خوانده شد
const SWIPE_DELETE_THRESHOLD = 80;   // راست → حذف

const NotifCardMobile = ({ item, handleDelete, handleRead }) => {
  const x = useMotionValue(0);

  // رنگ پس‌زمینه چپ (سبز) بر اساس میزان کشیدن به چپ
  const readOpacity = useTransform(x, [0, SWIPE_READ_THRESHOLD], [0, 1]);
  // رنگ پس‌زمینه راست (قرمز) بر اساس میزان کشیدن به راست
  const deleteOpacity = useTransform(x, [0, SWIPE_DELETE_THRESHOLD], [0, 1]);

  const handleDragEnd = (e, info) => {
    const offset = info.offset.x;

    if (offset < SWIPE_READ_THRESHOLD && !item.is_read) {
      // سوایپ به چپ → خوانده شد
      animate(x, -120, { duration: 0.2 }).then(() => {
        handleRead(item);
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      });

    } else if (offset > SWIPE_DELETE_THRESHOLD) {
      animate(x, 80, { type: "spring", stiffness: 300, damping: 30 });
      
      // callback رو پاس میدیم که وقتی cancel زده شد x رو reset کنه
      handleDelete(item, () => {
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      });
    } else {
      // لغو → برگشت به جای اول
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  return (
    <div className={style.swipeWrapper}>

      {/* پس‌زمینه چپ — خوانده شد (سبز) */}
      <motion.div
        className={style.readAction}
        style={{ opacity: readOpacity }}
      >
        <UilCheckCircle />
      </motion.div>

      {/* پس‌زمینه راست — حذف (قرمز) */}
      <motion.div
        className={style.deleteAction}
        style={{ opacity: deleteOpacity }}
      >
        <UilTrashAlt />
      </motion.div>

      {/* کارت اصلی */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.1}
        style={{ x }}
        whileTap={{ cursor: "grabbing" }}
        animate={item.is_read ? { scale: 0.98, opacity: 0.7 } : { scale: 1, opacity: 1 }}
        onDragEnd={handleDragEnd}
        className={`${style.notifCard} ${!item.is_read ? style.unread : style.read}`}
      >
        <div className={style.notifCardWrapper}>

          <div className={style.notifIcon}>
            <span className={`${style.notifIconWrapper} ${style[item.category]}`}>
              {NotifCategory[item.category] ?? item.category}
            </span>
          </div>

          <div className={style.notifInfo}>
            <strong>{item.title}</strong>
            <p>{item.message}</p>
          </div>

          <div className={style.notifTime}>
            <p>{timeAgo(item.created_at)}</p>
          </div>

        </div>

        {!item.is_read && <span className={style.newNotifDot} />}
      </motion.div>
    </div>
  );
};

export default NotifCardMobile;

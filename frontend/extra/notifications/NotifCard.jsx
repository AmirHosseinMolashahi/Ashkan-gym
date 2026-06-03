import React, {useState, useEffect} from 'react'
import toPersianDigits from '../../../../hooks/convertNumber';
import { UilTrashAlt, UilMegaphone, UilCalendar, UilUsdCircle, UilSignin, UilLaptop, UilCheckSquare, UilCheckCircle} from '@iconscout/react-unicons'
import style from './NotifCard.module.scss';
import { parseISO, formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import { motion } from "framer-motion";

export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoint
  );

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const handler = (e) => setIsMobile(e.matches);

    media.addEventListener("change", handler);

    return () => media.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
};

export function timeAgo(dateString) {
  return formatDistanceToNow(parseISO(dateString), {
    addSuffix: true,
    locale: faIR,
  });
}

const NotifCard = ({item, handleDelete, handleRead}) => {
  const isMobile = useIsMobile();
  const NotifCategory = {
    announcements : <UilMegaphone  />,
    reminders : <UilCalendar />,
    tuition: <UilUsdCircle />,
    courses: <UilLaptop />,
    registration: <UilSignin />,
  }
  return (
    <div className={style.swipeWrapper}>
      <div className={style.readAction}>
        ✓ خوانده شد
      </div>
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.15}
        whileTap={{ cursor: "grabbing" }}
        animate={item.is_read ? { scale: 0.98, opacity: 0.7 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        onDragEnd={(e, info) => {
          if (info.offset.x < -100 && !item.is_read) {
            handleRead(item.id);
          }
        }}
        className={`
          ${style.notifCard}
          ${!item.is_read ? style.unread : style.read}
        `}
      >
        <div className={style.notifCardWrapper}>
          <div className={style.notifIcon}>
            <span className={`${style.notifIconWrapper} ${style[item.category]}`}>
              {NotifCategory[item.category] ? NotifCategory[item.category] : item.category}  
            </span>
          </div>
          <div className={style.notifInfo}>
            <strong>{item.title}</strong>
            <p>{item.message}</p>
          </div>
          <div className={style.notifTime}>
            <p>{timeAgo(item.created_at)}</p>
          </div>
          {!isMobile && (
            <div className={style.notifAction}>
              {item.is_read === false && (
                <span className={style.readNotif}><UilCheckCircle onClick={() => handleRead(item)}/></span>
              )}
              <span className={style.deleteNotif}><UilTrashAlt onClick={() => handleDelete(item)} /></span>
            </div>
          )}
        </div>
        {item.is_read === false ? (
          <span className={style.newNotifDot} />
        ) : ''}
      </motion.div>
    </div>
  )
}

export default NotifCard
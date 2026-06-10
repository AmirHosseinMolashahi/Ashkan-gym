import React, { useState, useEffect, useRef } from "react";
import styles from './StudentsCard.module.scss';
import { UilMobileAndroid, UilCheckCircle, UilTimesCircle, UilUsdCircle, UilCalendar } from '@iconscout/react-unicons'
import StudentsCardsSkeleton from "./studentsCardsSkeleton/StudentsCardsSkeleton";

const StudentsCard = ({ data, onDeactivate, onReactivate, loading }) => {
  const [activeCard, setActiveCard] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setActiveCard(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    loading ? (
      <StudentsCardsSkeleton />
    ) : (
      <div className={styles.cardsContainer}>
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={item.id} className={styles.card}>
              
              <div className={styles.cardHeader}>
                <img src={item.student.profile_picture} />
                <div className={styles.info}>
                  <strong>
                    {item.student.first_name} {item.student.last_name}
                  </strong>
                  <p>{item.student.national_id}</p>
                </div>
                <div className={styles.phone_number}>
                  <UilMobileAndroid />
                  <span>{item.student.phone_number}</span>
                </div>
                <button className={styles.actionBtn} onClick={() => setActiveCard(activeCard === item.id ? null : item.id)}>...</button>
                <div
                  ref={menuRef}
                  className={`${styles.cardActions} ${
                    activeCard === item.id ? styles.active : ""
                  }`}
                >
                  {item.status === "active" ? (
                    <button onClick={() => onDeactivate(item)}>
                      غیر فعال کردن
                    </button>
                  ) : (
                    <button onClick={() => onReactivate(item)}>
                      فعال کردن
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.cardInfo}>
                <div className={`${styles.row} ${styles.status}`}>
                  {item.status === "active" ? (
                    <span className={styles.active}><UilCheckCircle /> فعال</span>
                  ) : (
                    <span className={styles.inactive}><UilTimesCircle /> غیرفعال</span>
                  )}
                </div>

                <div className={`${styles.row} ${styles.attnedance}`}>
                  <span><UilCalendar /> {item.attendance_percentage ?? "-"} %</span>
                </div>

                <div className={`${styles.row} ${styles.payment}`}>
                  {item.tuition_status ? (
                    <span className={`${styles.badge} ${styles[item.tuition_status?.status]}`}>
                      <UilUsdCircle />
                      {item.tuition_status?.status === "unpaid" && "پرداخت نشده"}
                      {item.tuition_status?.status === "partially_paid" && "نیمه پرداخت"}
                      {item.tuition_status?.status === "paid" && "پرداخت شده"}
                      {item.tuition_status?.status === "canceled" && "لغو شده"}
                    </span>
                  ) : '-'}
                </div>
              </div>

            </div>
          ))
        ) : (
          <p>هیچ ورزشکاری پیدا نشد!</p>
        )}
      </div>
    )
  );
}

export default StudentsCard;
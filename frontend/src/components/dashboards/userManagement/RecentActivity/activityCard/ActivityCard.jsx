import React from 'react'
import styles from "./ActivityCard.module.scss";
import { UilClockFive, UilTrashAlt, UilTimes, UilHeartRate} from '@iconscout/react-unicons'
import toPersianDigits from '../../../../../hooks/convertNumber';
import roleConverter from '../../../../../hooks/roleConverter';

const ActivityCard = ({ data }) => {
  return (
    <div className={styles.usersCard}>
      {data.length === 0 ? (
        <p>هیچ فعالیتی پیدا نشد!!!</p>
      ) : (
        data.map((item, index) => (
          <div key={item.id ?? index} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.userInfo}>
                <img src={item.actor.profile_picture} alt={item.full_name} />
                <div>
                  <strong>{item.actor.full_name}</strong>
                  <p>{item.actor.national_id}</p>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button>
                  <UilTrashAlt fill='#C1121F' />
                </button>
              </div>
            </div>
            <div className={styles.statusContainer}>
              <span className={styles.roleBadge}>
                {roleConverter(item.actor.roles)}
              </span>
              <span className={`${styles.badge} ${item.actor.is_active ? styles.active : styles.inactive}`}>
                {item.actor.is_active ? 'فعال' : 'غیرفعال'}
              </span>
              <p className={styles.activityTime}>{toPersianDigits((item.created_at_jalali || "").split(" ")[0] || "-")} <UilClockFive /></p>
            </div>
            <div className={styles.cardInfo}>
              <div><UilHeartRate /> آخرین فعالیت</div>
              <p>{item.description}</p>
            </div>
          </div>
          ) 
        )
      )}
    </div>
  )
}

export default ActivityCard;
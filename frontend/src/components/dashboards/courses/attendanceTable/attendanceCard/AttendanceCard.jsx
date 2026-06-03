import React from 'react'
import styles from './AttendanceCard.module.scss';
import { UilCheck, UilTimes, UilClock } from "@iconscout/react-unicons";

const AttendanceCard = ({data, onStatusChange, onNoteChange}) => {
  return (
    <div className={styles.cardContainer}>
      {data.length > 0 ? (
        data.map((item, index) => (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <img src={item.profile_picture} />
              <div className={styles.info}>
                <strong>
                  {item.student_name}
                </strong>
                <p>{item.national_id}</p>
              </div>
            </div>
            <div className={styles.cardInfo}>
              <div className={styles.btnContainer}>
                <button
                  className={`${item.status === "present" ? styles.active : ""} ${styles.present}`}
                  onClick={() => onStatusChange(item.student, "present")}
                >
                حاضر <UilCheck />
              </button>
                <button
                  className={`${item.status === "absent" ? styles.active : ""} ${styles.absent}`}
                  onClick={() => onStatusChange(item.student, "absent")}
                >
                  غایب <UilTimes /></button>
                <button
                  className={`${item.status === "late" ? styles.active : ""} ${styles.late}`}
                  onClick={() => onStatusChange(item.student, "late")}
                >
                  تاخیر <UilClock />
                </button>
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  placeholder="توضیحات"
                  value={item.note || ""}
                  onChange={e => onNoteChange(item.student, e.target.value)}
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>هیچ دیتایی موجود نیست!</p>
      )}
    </div>
  )
}

export default AttendanceCard
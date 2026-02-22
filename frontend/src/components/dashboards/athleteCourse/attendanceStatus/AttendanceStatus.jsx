import React, { useEffect, useMemo, useState } from "react";
import styles from "./AttendanceStatus.module.scss";
import api from "../../../../hooks/api";

const AttendanceStatus = ({ myClasses }) => {

  const [ classAttendanceList, setClassAttendanceList ] = useState([])
  const [ selectedClass, setSelectedClass ] = useState(null)

  const fetchClassAttendance = async (id) => {
    try {
      const res = await api.get(`training/my-classes/${id}/sessions/attendance-status/`)
      console.log(res.data)
      setClassAttendanceList(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const classPercentage = useMemo(() => {
    myClasses.map((item) => {
      item.course.id === classAttendanceList.course_id
      ? setSelectedClass(item)
      : ''
    })
  }, [classAttendanceList])

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.leftContainer}>
          <h1>وضعیت حضور و غیاب</h1>
          <p className={styles.subtitle}>
            یک کلاس انتخاب کنید تا وضعیت حضور و غیاب را ببینید.
          </p>

          <select className={styles.select}
            onChange={e => {
              e.target.value === 'empty'
              ? (setClassAttendanceList([]) && setSelectedClass(null)) 
              : fetchClassAttendance(e.target.value)
            }}
          >
            <option value={'empty'}>--------------</option>
            {myClasses?.map((item, index) => {
              return(
                <option key={index} value={item.course.id}>{item.course.title} - {item.course.age_ranges.map(item => item.title  + ' ')} - مربی: {item.course.coach.full_name}</option>
              )
            })}
          </select>

          <div className={styles.card}>
            <h2>حضور و غیاب ماهانه</h2>
            <p className={styles.smallText}>
              وضعیت حضور شما در هر ماه
            </p>

            <div className={styles.monthList}>
              {classAttendanceList?.length !== 0 ? (
                classAttendanceList?.months?.map((item, index) => (
                  <div key={index} className={styles.monthItem}>
                    <div>
                      <h3>{item.month_name}</h3>
                      <p>
                        {item.total_sessions} جلسه - {item.present_count} جلسه حاضر
                      </p>
                    </div>
                    <span
                      className={`${styles.badge} ${
                        styles[item.attendance_percentage_status]
                      }`}
                    >
                      {item.attendance_percentage_status === "excellent"
                        ? "عالی"
                        : item.attendance_percentage_status === "good"
                        ? "خوب"
                        : "نیاز به توجه بیشتر"}
                    </span>
                  </div>
                ))
              ) : (
                <p>هیچ کلاسی انتخاب نشده است!!!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.summaryCard}>
          <h2>گزارش حضور و غیاب</h2>
          <p className={styles.smallText}>
            برای هر کلاس و هر ماه به صورت مجزا
          </p>

          <div className={styles.profile}>
            <div className={styles.avatar}>
              <img src={selectedClass ? selectedClass.course.avatar : ''} alt="" />
            </div>
            <div>
              <h4>{selectedClass ? selectedClass.course.title : 'کلاسی انتخاب نشده است.'}</h4>
              <p>عضویت از: {selectedClass ? selectedClass.joined_at_jalali.split(' ', 1) : ''}</p>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.statBox}>
              <h3>{selectedClass ? selectedClass.attendance_summary.attendance_percentage : '--'}</h3>
              <p>درصد حضور در کلاس</p>
            </div>
            <div className={styles.statBox}>
              <h3>{myClasses.length}</h3>
              <p>تعداد کلاس های شما</p>
            </div>
          </div>

          <ul className={styles.legend}>
            <li>عالی: + 84 درصد حضور</li>
            <li>خوب: 60 تا 84 درصد حضور</li>
            <li>نیاز به توجه بیشتر: کمتر از 60 درصد حضور</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStatus;

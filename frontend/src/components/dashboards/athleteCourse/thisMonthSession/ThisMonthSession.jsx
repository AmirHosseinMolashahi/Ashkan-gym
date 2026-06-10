import React, {useState, useEffect} from 'react'
import style from './ThisMonthSession.module.scss'
import useCurrentDateTime from '../../../../hooks/currentDateTime';
import toPersianDigits from '../../../../hooks/convertNumber';
import api from '../../../../hooks/api';
import { UilCalendar, UilUser } from '@iconscout/react-unicons'
import ClassSessionSkeleton from './classSessionSkeleton/ClassSessionSkeleton';

const ThisMonthSession = ({athleteInfo}) => {

  const {date, weekday, month} = useCurrentDateTime()

  const [monthAttendance, setMonthAttendance] = useState([])

  const [loading, setLoading] = useState(false)

  const fetchMonthAttendance = async () => {
    try {
      setLoading(true)
      const res = await api.get('/training/my-classes/attendance/')
      setMonthAttendance(res.data.results)
      console.log(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
      fetchMonthAttendance();
    }, [])
  

  return (
    <div className={style.classContent}>
      <div className={style.rightContent}>
        {loading === true ? (
          <ClassSessionSkeleton />
        ) : (
          monthAttendance ? (
            monthAttendance.map((item, index) => {
              return (
                <div className={style.rightContItem} key={index}>
                  <div className={style.classInfo}>
                    <div className={style.avatar}><img src={item.course.avatar} alt=""/></div>
                    <div className={style.baseInfo}>
                      <h3>کلاس {item.course.title}</h3>
                      <div className={style.infoContainer}>
                        <UilCalendar />
                        <p> هر {toPersianDigits(item.course.schedule)}</p>
                      </div>
                      <div className={style.infoContainer}>
                        <UilUser />
                        <p> مربی: {item.course.coach.full_name}</p>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <p>جلسات {month} ماه</p>
                  <ul className={style.sessionDate}>
                    {item.attendances.map((s, i) => {
                      if (s.session_attendance_status === "unfinished") {
                        return (
                          <li key={i} className={item.course.next_session.date === s.session_date ? style.next : ""}>
                            <p>{s.day_of_week}</p>
                            <h4>{toPersianDigits(s.date_jalali.split("/")[2])}</h4>
                          </li>
                        );
                      } else {
                        if (s.status === "absent") {
                          return (
                            <li key={i} className={style.absent}>
                              <p>{s.day_of_week}</p>
                              <h4>{toPersianDigits(s.date_jalali.split("/")[2])}</h4>
                            </li>
                          );
                        }

                        if (s.status === "present") {
                          return (
                            <li key={i} className={style.present}>
                              <p>{s.day_of_week}</p>
                              <h4>{toPersianDigits(s.date_jalali.split("/")[2])}</h4>
                            </li>
                          );
                        }

                        if (s.status === "late") {
                          return (
                            <li key={i} className={style.late}>
                              <p>{s.day_of_week}</p>
                              <h4>{toPersianDigits(s.date_jalali.split("/")[2])}</h4>
                            </li>
                          );
                        } else {
                          return (
                            <li key={i} className={item.course.next_session.date === s.session_date ? style.next : ""}>
                              <p>{s.day_of_week}</p>
                              <h4>{toPersianDigits(s.date_jalali.split("/")[2])}</h4>
                            </li>
                          )
                        }
                      }
                      return null;
                    })}
                  </ul>
                </div>
              )
            })
          ) : (
            <p>هیچ کلاسی برای شما پیدا نشد!!!</p>
          )
        )
        }
      </div>
      {/* ستون سمت چپ */}
      <div className={style.leftContent}>
        <div className={style.leftContHeader}>
          <h3 className={style.title}>وضعیت جلسات این ماه</h3>
          <p className={style.info}>وضعیت {month} ماه - فقط جهت نمایش</p>
        </div>
        <div className={style.leftContItem}>
          <h3 className={style.title}>تعداد کلاس ها</h3>
          <ul>
            <li>
              <div className={`${style.listItem} ${style.info}`}>حاضر در کلاس <div className={style.present}></div></div>
            </li>
            <li>
              <div className={`${style.listItem} ${style.info}`}>غایب <div className={style.absent}></div></div>
            </li>
            <li>
              <div className={`${style.listItem} ${style.info}`}>حضور با تاخیر <div className={style.late}></div></div>
            </li>
            <li>
              <div className={`${style.listItem} ${style.info}`}>کلاس بعدی <div className={style.next}></div></div>
            </li>
            <li>
              <div className={`${style.listItem} ${style.info}`}>کلاس های آینده <div className={style.allNext}></div></div>
            </li>
          </ul>
        </div>
        <div className={style.leftContItem}>
          <h3 className={style.title}>خلاصه</h3>
          <div className={style.summaryList}>
            <div className={style.sumItem}>
              <p className={style.info}>جلسات این ماه</p>
              <h3 className={style.title}>{toPersianDigits(athleteInfo?.total_sessions)}</h3>
            </div>
            <div className={style.sumItem}>
              <p className={style.info}>درصد حضور</p>
              <h3 className={style.title}>{toPersianDigits(athleteInfo?.attendance_percentage)} %</h3>
            </div>
            <div className={style.progressBar}>
              <div
                className={style.progressFill}
                style={{ width: `${athleteInfo?.attendance_percentage}%` }}
              />
            </div>
          </div>
          <p className={`${style.itemDetail} ${style.info}`}>برای دیدن اطلاعات هر جلسه بر روی آن جلسه کلیک کنین.</p>
        </div>
      </div>
    </div>
  )
}

export default ThisMonthSession
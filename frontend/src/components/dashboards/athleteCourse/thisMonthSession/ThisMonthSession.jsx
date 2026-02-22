import React, {useState, useEffect} from 'react'
import style from './ThisMonthSession.module.scss'
import useCurrentDateTime from '../../../../hooks/currentDateTime';
import toPersianDigits from '../../../../hooks/convertNumber';
import api from '../../../../hooks/api';

const ThisMonthSession = ({myClasses, athleteInfo}) => {

  const {date, weekday, month} = useCurrentDateTime()

  // const [thisMonthAllSession, setThisMonthAllSession] = useState(0)

  // const fetchThisMonthSession = async () => {
  //   try {
  //     const res = await api.get(`/training/my-classes/sessions/?year=${myClasses[0].sessions[0].date_jalali.split('/')[0]}&month=${myClasses[0].sessions[0].date_jalali.split('/')[1]}`)
  //     setThisMonthAllSession(res.data)
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // useEffect(() => {
  //     fetchThisMonthSession();
  //   }, [])
  

  return (
    <div className={style.classContent}>
      <div className={style.rightContent}>
        {myClasses ? (
          myClasses.map((item, index) => {
            return (
              <div className={style.rightContItem} key={index}>
                <ul className={style.classInfo}>
                  <li><img src={item.course.avatar} alt="" style={{width: '64px', height: '64px'}} /></li>
                  <li>
                    <h3>کلاس {item.course.title}</h3>
                    <p>هر {item.course.schedule} - مربی: {item.course.coach.full_name}
                    </p>
                  </li>
                </ul>
                <hr />
                <p>جلسات {month} ماه</p>
                <ul className={style.sessionDate}>
                  {item.sessions.map((s, i) => {
                    if (s.attendance_status === "unfinished") {
                      return (
                        <li key={i} className={item.next_session.date === s.date ? style.next : ""}>
                          <p>{s.day_of_week}</p>
                          <h4>{toPersianDigits(s.date_jalali.split("/")[2])}</h4>
                        </li>
                      );
                    } else {
                      if (s.attendance_status_user === "absent") {
                        return (
                          <li key={i} className={style.absent}>
                            <p>{s.day_of_week}</p>
                            <h4>{toPersianDigits(s.date_jalali.split("/")[2])}</h4>
                          </li>
                        );
                      }

                      if (s.attendance_status_user === "present") {
                        return (
                          <li key={i} className={style.present}>
                            <p>{s.day_of_week}</p>
                            <h4>{toPersianDigits(s.date_jalali.split("/")[2])}</h4>
                          </li>
                        );
                      }

                      if (s.attendance_status_user === "late") {
                        return (
                          <li key={i} className={style.late}>
                            <p>{s.day_of_week}</p>
                            <h4>{toPersianDigits(s.date_jalali.split("/")[2])}</h4>
                          </li>
                        );
                      } else {
                        return (
                          <li key={i} className={item.next_session.date === s.date ? style.next : ""}>
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
          <p>در حال حاضر در هیج کلاسی ثبت نام نشده اید.</p>
        )
        }
      </div>
      {/* ستون سمت چپ */}
      <div className={style.leftContent}>
        <div className={style.leftContHeader}>
          <h3>وضعیت جلسات این ماه</h3>
          <p>وضعیت {month} ماه - فقط جهت نمایش</p>
        </div>
        <div className={style.leftContItem}>
          <h3>تعداد کلاس ها</h3>
          <ul>
            <li>
              <div className={style.listItem}>حاضر در کلاس <div className={style.present}></div></div>
            </li>
            <li>
              <div className={style.listItem}>غایب <div className={style.absent}></div></div>
            </li>
            <li>
              <div className={style.listItem}>حضور با تاخیر <div className={style.late}></div></div>
            </li>
            <li>
              <div className={style.listItem}>کلاس بعدی <div className={style.next}></div></div>
            </li>
            <li>
              <div className={style.listItem}>کلاس های آینده <div className={style.allNext}></div></div>
            </li>
          </ul>
        </div>
        <div className={style.leftContItem}>
          <h3>خلاصه</h3>
          <ul>
            <li>
              <p>جلسات این ماه</p>
              <h3>{athleteInfo?.total_sessions}</h3>
            </li>
            <li>
              <p>درصد حضور</p>
              <h3>{athleteInfo?.attendance_percentage} %</h3>
            </li>
          </ul>
          <p className={style.itemDetail}>برای دیدن اطلاعات هر جلسه بر روی آن جلسه کلیک کنین.</p>
        </div>
      </div>
    </div>
  )
}

export default ThisMonthSession
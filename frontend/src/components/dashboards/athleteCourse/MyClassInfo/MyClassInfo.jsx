import React, {useState, useEffect} from 'react'
import style from './MyClassInfo.module.scss'
import {UilCheckCircle, UilTimesCircle, UilCheck, UilClock } from '@iconscout/react-unicons';
import useCurrentDateTime from '../../../../hooks/currentDateTime';
import api from '../../../../hooks/api';
import toPersianDigits from '../../../../hooks/convertNumber';

const MyClassInfo = ({myClasses, athleteInfo}) => {

  const {date, weekday, month} = useCurrentDateTime()

  const [thisMonthAllSession, setThisMonthAllSession] = useState(0)

  const fetchThisMonthSession = async () => {
    try {
      const res = await api.get(`/training/my-classes/sessions/?year=${myClasses[0].sessions[0].date_jalali.split('/')[0]}&month=${myClasses[0].sessions[0].date_jalali.split('/')[1]}`)
      console.log(res.data)
      setThisMonthAllSession(res.data)
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchThisMonthSession();
  }, [])
  
  return (
    <div className={style.classContent}>
      <div className={style.rightContent}>
        {myClasses ? (
          myClasses.map((item, index) => {
            return (
              <div className={style.rightContItem} key={index}>
                <ul>
                  <li><img src={item.course.avatar} alt="" style={{width: '64px', height: '64px'}} /></li>
                  <li>
                    <div className={style.classInfo}>
                      <h3>کلاس {item.course.title}</h3>
                      <p>هر {toPersianDigits(item.course.schedule)} - مربی: {item.course.coach.full_name}</p>
                    </div>
                    <div className={style.attendance}>
                      <span className={style.present}><UilCheckCircle /> {toPersianDigits(item.present_count)} جلسه حضور</span>
                      <span className={style.late}><UilClock /> {toPersianDigits(item.late_count)} جلسه تاخیر</span>
                      <span className={style.absent}><UilTimesCircle /> {toPersianDigits(item.absent_count)} جلسه غیبت</span>
                    </div>
                  </li>
                  <li>
                    <h3>درصد حضور</h3>
                    <span>{toPersianDigits(item.attendance_percentage)} %</span>
                  </li>
                  <li>
                    <h3>شهریه‌ی {month} ماه</h3>
                      {item.payment_status.status === 'paid' ? (
                        <span className={style.payment}><UilCheck /> پرداخت شده</span>
                      ) : (
                        <span className={`${style.payment} ${style.unpaid}`}><UilTimesCircle /> پرداخت نشده</span>
                      )}
                  </li>
                </ul>
                <hr />
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
          <h3>وضعیت این ماه</h3>
          <p>وضعیت {month} ماه - فقط جهت نمایش</p>
        </div>
        <div className={style.leftContItem}>
          <h3>تعداد کلاس ها</h3>
          <ul>
            <li>
              <p>کلاس های فعال شما</p>
              <h3>{toPersianDigits(athleteInfo?.total_courses)}</h3>
            </li>
            <li>
              <p>تاریخ ثبت نام</p>
              <h3>{toPersianDigits(myClasses[0]?.joined_at_jalali.split(' ', 1))}</h3>
            </li>
          </ul>
          <p className={style.itemDetail}>برای ثبت نام کلاس جدید به مدیر باشگاه مراجعه شود.</p>
        </div>
        <div className={style.leftContItem}>
          <h3>حضور و غیاب ({month} ماه)</h3>
          <ul>
            <li>
              <p>جلسات این ماه</p>
              <h3>{toPersianDigits(athleteInfo?.total_sessions)}</h3>
            </li>
            <li>
              <p>حضور</p>
              <h3 style={{color: '#2ECC71'}}>{toPersianDigits(athleteInfo?.total_present)}</h3>
            </li>
            <li>
              <p>غیبت</p>
              <h3 style={{color: '#C1121F'}}>{toPersianDigits(athleteInfo?.total_absent)}</h3>
            </li>
            <li>
              <p>باقی مانده</p>
              <h3 style={{color: '#3b82f6'}}>{toPersianDigits(athleteInfo?.remaining_sessions)}</h3>
            </li>
          </ul>
          <p className={style.itemDetail}>حضور و غیاب برای هر ماه به صورت جداگانه محاسبه میشوند.</p>
        </div>
        <div className={style.leftContItem}>
          <h3>پرداخت شهریه</h3>
          <ul>
            <li>
              <p>وضعیت پرداخت</p>
              <h3>{athleteInfo?.next_payment?.status === 'unpaid' ? 'پرداخت نشده' : 'پرداخت شده'}</h3>
            </li>
            <li>
              <p>پرداخت بعدی</p>
              <h3>{athleteInfo?.next_payment?.status === 'unpaid' ? (
                toPersianDigits(athleteInfo?.next_payment?.due_date_jalali)
              ) : (
                'شما هیچ پرداختی ندارید'
              )}</h3>
            </li>
            <li>
              <p>بدهکاری شما</p>
              <h3>{toPersianDigits(athleteInfo?.next_payment?.amount)} تومان</h3>
            </li>
          </ul>
          <p className={style.itemDetail}>شما فقط میتوانید وضعیت کلاس، حضور و پرداخت خودتون رو ببینید و همه‌ی تغییرات توسط مربی و مدیر انجام میگیرد.</p>
        </div>
      </div>
    </div>
  )
}

export default MyClassInfo
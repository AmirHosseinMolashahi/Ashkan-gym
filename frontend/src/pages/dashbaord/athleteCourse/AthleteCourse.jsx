import React, { useEffect, useState } from 'react'
import style from './AthleteCourse.module.scss';
import { useSelector } from 'react-redux';
import useCurrentDateTime from '../../../hooks/currentDateTime';
import MyClassCard from '../../../components/dashboards/courses/myClassCard/MyClassCard';
import { UilClock, UilStatistics, UilCreditCard, UilCheckCircle, UilTimesCircle, UilCheck  } from '@iconscout/react-unicons';
import api from '../../../hooks/api';
import MyClassInfo from '../../../components/dashboards/athleteCourse/MyClassInfo/MyClassInfo';
import ThisMonthSession from '../../../components/dashboards/athleteCourse/thisMonthSession/ThisMonthSession';
import LastMonthSession from '../../../components/dashboards/athleteCourse/lastMonthSession/LastMonthSession';
import AttendanceStatus from '../../../components/dashboards/athleteCourse/attendanceStatus/AttendanceStatus';
import toPersianDigits from '../../../hooks/convertNumber';

const AthleteCourse = () => {

  const { user } = useSelector(
    state => state.auth
  )
  const {date, weekday, month} = useCurrentDateTime()
  const [myClasses, setMyClasses] = useState([])
  const [ activeList, setActiveList ] = useState(1)
  const [ nextSession, setNextSession ] = useState(null)
  const [ athleteInfo, setAthleteInfo ] = useState(null)

  // const fetchUserClasses = async () => {
  //   try {
  //     const res = await api.get('/training/my-classes/');
  //     console.log(res.data)
  //     setMyClasses(res.data)
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  // const fetchNextSession = async () => {
  //   try {
  //     const res = await api.get('/training/my-classes/next-session/');
  //     setNextSession(res.data.next_session)
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  // const fetchAthleteInfo = async () => {
  //   try {
  //     const res = await api.get('/training/my-classes/info/')
  //     console.log(res.data)
  //     setAthleteInfo(res.data)
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  const fetchDashboardInfo = async () => {
    try {
      const res = await api.get('/training/my-classes/dashboard/');
      console.log(res.data)
      setNextSession(res.data.next_session)
      setAthleteInfo(res.data.dashboard)
      setMyClasses(res.data.enrollments)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchDashboardInfo();
  }, [])

  return (
    <div className={style.athleteCourse}>
      <div className={style.container}>
        <div className={style.header}>
          <p>لیست کلاس های شما، <b>{user.full_name}</b> عزیز.</p>
          <p>امروز {weekday}, {date}</p>
        </div>
        <div className={style.classInfoCard}>
          <MyClassCard
            icon={<UilClock />} 
            title='جلسه بعدی'
            body={
              nextSession ? (
                `${nextSession?.day_of_week === weekday ? 'امروز' : nextSession?.day_of_week} - ${nextSession ? toPersianDigits(nextSession?.date_jalali) : ''}`
              ) : 'هیچ جلسه ای پیدا نشد!'
            }
            footer={
              nextSession ? 
              `کلاس ${nextSession?.course}` :
              'در حال حاضر کلاس فعال ندارید.'
            }
          />
          {/* ${nextSession?.course.age_ranges.map(item => item.title)} */}
          <MyClassCard
            icon={<UilStatistics />}
            title='درصد حضور در ماه'
            body={
              athleteInfo?.total_courses >= 1 ?
              `${toPersianDigits(athleteInfo?.attendance_percentage)} %` :
              '-'
            }
            footer={athleteInfo?.total_courses >= 1 ?
              athleteInfo?.trend !== null ? `${toPersianDigits(athleteInfo?.attendance_difference)} از ماه گذشته` : 'اطلاعات کافی برای نمایش وجود ندارد' :
              '-'
            }
          />
          <MyClassCard
            icon={<UilCreditCard />} 
            title='وضعیت پرداخت'
            body={athleteInfo?.next_payment?.remaining > 0 ? (
              <span className={style.unpaid}><UilTimesCircle /> پرداخت نشده - برای کلاس {athleteInfo?.next_payment?.course}</span>
            ) : (
              <span className={style.paid}><UilCheckCircle /> پرداخت شده - برای کلاس {athleteInfo?.next_payment?.course}</span>
            )}
            footer={athleteInfo?.next_payment?.status === 'unpaid' ? `مبلغ ${toPersianDigits(athleteInfo.next_payment.amount)} تومان - سررسید ${toPersianDigits(athleteInfo.next_payment.due_date_jalali)}` : 'شما هیچ پرداختی ندارید'}
          />
        </div>
        <div className={style.classInfoList}>
          <div className={style.topPageInfo}>
            <div className={style.topPageTitle}>
              <h2>کلاس های من</h2>
              <p>کلاس ها و جلسات</p>
            </div>
          </div>
          <div className={style.classList}>
            <div className={style.headerContainer}>
              <button className={activeList === 1 ? style.active : ''} onClick={() => setActiveList(1)}>همه کلاس ها</button>
              <button className={activeList === 2 ? style.active : ''} onClick={() => setActiveList(2)}>این ماه ({month})</button>
              <button className={activeList === 3 ? style.active : ''} onClick={() => setActiveList(3)}>گزارش حضور و غیاب</button>
            </div>
            <hr style={{marginTop: '1rem'}}/>
            { activeList === 1 && (
              <MyClassInfo myClasses={myClasses} athleteInfo={athleteInfo}/>
            )}
            { activeList === 2 && (
              <ThisMonthSession athleteInfo={athleteInfo}/>
            )}
            { activeList === 3 && (
              <AttendanceStatus myClasses={myClasses}/>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AthleteCourse
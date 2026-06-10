import React, { useEffect, useState } from 'react'
import style from './AthleteCourse.module.scss';
import { useSelector } from 'react-redux';
import useCurrentDateTime from '../../../hooks/currentDateTime';
import MyClassCard from '../../../components/dashboards/courses/myClassCard/MyClassCard';
import { UilClock, UilStatistics, UilCreditCard, UilCheckCircle, UilTimesCircle, UilCheck, UilChartDown  } from '@iconscout/react-unicons';
import api from '../../../hooks/api';
import MyClassInfo from '../../../components/dashboards/athleteCourse/MyClassInfo/MyClassInfo';
import ThisMonthSession from '../../../components/dashboards/athleteCourse/thisMonthSession/ThisMonthSession';
import LastMonthSession from '../../../components/dashboards/athleteCourse/lastMonthSession/LastMonthSession';
import AttendanceStatus from '../../../components/dashboards/athleteCourse/attendanceStatus/AttendanceStatus';
import toPersianDigits from '../../../hooks/convertNumber';
import BackButton from '../../../components/dashboards/backButton/BackButton';
import ClassCardSkeleton from '../../../components/dashboards/athleteCourse/classCardSkeleton/ClassCardSkeleton';

const AthleteCourse = () => {

  const { user } = useSelector(
    state => state.auth
  )
  const {date, weekday, month} = useCurrentDateTime()
  const [myClasses, setMyClasses] = useState([])
  const [ activeList, setActiveList ] = useState(1)
  const [ nextSession, setNextSession ] = useState(null)
  const [ athleteInfo, setAthleteInfo ] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchDashboardInfo = async () => {
    try {
      setLoading(true)
      const res = await api.get('/training/my-classes/dashboard/');
      console.log(res.data)
      setNextSession(res.data.next_session)
      setAthleteInfo(res.data.dashboard)
      setMyClasses(res.data.enrollments)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardInfo();
  }, [])

  return (
    <div className={style.athleteCourse}>
      <div className={style.container}>
        <div className={style.header}>
          <BackButton route={'/dashboard'} title={'بازگشت'} />
          <p>لیست کلاس های شما، <b>{user.full_name}</b> عزیز.</p>
          <p>امروز {weekday}, {toPersianDigits(date)}</p>
        </div>
        <div className={style.classInfoCard}>
          <div className={style.cardPayment}>
            {loading === true ? (
              <ClassCardSkeleton />
            ) : (
              <MyClassCard
                icon={<UilCreditCard />}
                status={athleteInfo?.next_payment?.remaining > 0 ? 'unpaid' : 'paid'} 
                title='وضعیت پرداخت'
                body={athleteInfo?.next_payment?.remaining > 0 ? (
                  <span className={style.status}><UilTimesCircle /> پرداخت نشده - برای کلاس {athleteInfo?.next_payment?.course}</span>
                ) : (
                  <span className={style.status}><UilCheckCircle /> پرداخت شده - برای کلاس {athleteInfo?.next_payment?.course}</span>
                )}
                footer={athleteInfo?.next_payment?.status === 'unpaid' ? `مبلغ ${toPersianDigits(athleteInfo.next_payment.amount)} تومان - سررسید ${toPersianDigits(athleteInfo.next_payment.due_date_jalali)}` : 'شما هیچ پرداختی ندارید'}
              />
            )}
          </div>
          <div className={style.cardsRow}>
            <div className={style.cardNextSession}>
              {loading === true ? (
                <ClassCardSkeleton />
              ) : (
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
              )}
            </div>
            <div className={style.cardAttendance}>
              {loading === true ? (
                <ClassCardSkeleton />
              ) : (
                <MyClassCard
                  icon={athleteInfo?.trend === 'up' ? <UilStatistics /> : <UilChartDown />}
                  title='درصد حضور در ماه'
                  status={athleteInfo?.trend}
                  body={
                    athleteInfo?.total_courses >= 1 ?
                    `${toPersianDigits(athleteInfo?.attendance_percentage)} %` :
                    '-'
                  }
                  footer={athleteInfo?.total_courses >= 1 ?
                    (athleteInfo?.trend !== null ? `${toPersianDigits(athleteInfo?.attendance_difference)} از ماه گذشته` : 'اطلاعات کافی برای نمایش وجود ندارد')
                    : '-'}
                />
              )}
            </div>
          </div>
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
              <MyClassInfo myClasses={myClasses} athleteInfo={athleteInfo} loading={loading}/>
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
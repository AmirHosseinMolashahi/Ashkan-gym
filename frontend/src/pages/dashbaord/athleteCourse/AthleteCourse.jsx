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
import toPersianDigits from '../../../hooks/convertNumber';

const AthleteCourse = () => {

  const { user } = useSelector(
    state => state.auth
  )
  const {date, weekday, month} = useCurrentDateTime()
  const [myClasses, setMyClasses] = useState([])
  const [ activeList, setActiveList ] = useState(1)
  const [ nextSession, setNextSession ] = useState(null)
  const [ lastMonthClass, setLastMonthClass] = useState([])

  const fetchUserClasses = async () => {
    try {
      const res = await api.get('/training/my-classes/');
      setMyClasses(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchNextSession = async () => {
    try {
      const res = await api.get('/training/my-classes/next-session/');
      setNextSession(res.data.next_session)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchLastMonthSession = async () => {
    try {
      const res = await api.get('/training/my-classes/last-month/');
      console.log(res.data)
      setLastMonthClass(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchUserClasses();
    fetchNextSession();
    fetchLastMonthSession();
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
            body={`${nextSession?.day_of_week === weekday ? 'امروز' : nextSession?.day_of_week} - ${nextSession ? toPersianDigits(nextSession?.date_jalali) : ''}`}
            footer={`${nextSession?.course.title} - ${nextSession?.course.age_ranges.map(item => item.title)}`}
          />
          <MyClassCard
            icon={<UilStatistics />}
            title='درصد حضور در ماه'
            body='92%'
            footer='+ 4% از ماه گذشته'
          />
          <MyClassCard
            icon={<UilCreditCard />} 
            title='وضعیت پرداخت'
            body='پرداخت شده'
            footer='پرداخت بعدی شما 10 روز دیگه'
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
              <button className={activeList === 2 ? style.active : ''} onClick={() => setActiveList(2)}>این ماه</button>
              <button className={activeList === 3 ? style.active : ''} onClick={() => setActiveList(3)}>ماه قبل</button>
            </div>
            <hr style={{marginTop: '1rem'}}/>
            { activeList === 1 && (
              <MyClassInfo myClasses={myClasses} />
            )}
            { activeList === 2 && (
              <ThisMonthSession myClasses={myClasses} />
            )}
            { activeList === 3 && (
              <LastMonthSession myClasses={lastMonthClass}/>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AthleteCourse
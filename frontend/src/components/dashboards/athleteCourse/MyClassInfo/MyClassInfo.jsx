import React, {useState, useEffect} from 'react'
import style from './MyClassInfo.module.scss'
import {UilCheckCircle, UilTimesCircle, UilCheck, UilClock } from '@iconscout/react-unicons';
import useCurrentDateTime from '../../../../hooks/currentDateTime';
import api from '../../../../hooks/api';
import toPersianDigits from '../../../../hooks/convertNumber';
import CourseCard from '../courseCard/CourseCard';
import CourseCardSkeleton from '../courseCard/courseCardSkeleton/CourseCardSkeleton';

const MyClassInfo = ({myClasses, athleteInfo, loading}) => {

  const {date, weekday, month} = useCurrentDateTime()
  
  return (
    <div className={style.classContent}>
      <div className={style.rightContent}>
        {loading === true ? (
          Array.from({ length: 2 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))
          ) : (
            myClasses ? (
              myClasses.map((item, index) => {
                return (
                  <CourseCard
                    title={item.course.title}
                    imageUrl={item.course.avatar}
                    isPaid={item.payment_status.status === 'paid' ? true : false}
                    schedule={item.course.schedule}
                    coach={item.course.coach.full_name}
                    attendancePercent={item.attendance_percentage}
                    presentCount={item.present_count}
                    lateCount={item.late_count}
                    absentCount={item.absent_count}
                  />
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
          <h3 className={style.title}>وضعیت این ماه</h3>
          <p className={style.info}>وضعیت {month} ماه - فقط جهت نمایش</p>
        </div>
        <div className={style.leftContItem}>
          <h3 className={style.title}>تعداد کلاس ها</h3>
          <ul>
            <li>
              <p className={style.info}>کلاس های فعال شما</p>
              <h3 className={style.title}>{toPersianDigits(athleteInfo?.total_courses)}</h3>
            </li>
            <li>
              <p className={style.info}>تاریخ ثبت نام</p>
              <h3 className={style.title}>{toPersianDigits(myClasses[0]?.joined_at_jalali.split(' ', 1))}</h3>
            </li>
          </ul>
          <p className={`${style.itemDetail} ${style.info}`}>برای ثبت نام کلاس جدید به مدیر باشگاه مراجعه شود.</p>
        </div>
        <div className={style.leftContItem}>
          <h3 className={style.title}>حضور و غیاب ({month} ماه)</h3>
          {athleteInfo?.total_courses >= 1 ? (
            <>
            <ul>
              <li>
                <p className={style.info}>جلسات این ماه</p>
                <h3 className={style.title}>{toPersianDigits(athleteInfo?.total_sessions)}</h3>
              </li>
              <li>
                <p className={style.info}>حضور</p>
                <h3 className={style.title} style={{color: '#2ECC71'}}>{toPersianDigits(athleteInfo?.total_present)}</h3>
              </li>
              <li>
                <p className={style.info}>غیبت</p>
                <h3 className={style.title} style={{color: '#C1121F'}}>{toPersianDigits(athleteInfo?.total_absent)}</h3>
              </li>
              <li>
                <p className={style.info}>باقی مانده</p>
                <h3 className={style.title} style={{color: '#3b82f6'}}>{toPersianDigits(athleteInfo?.remaining_sessions)}</h3>
              </li>
            </ul>
            <p className={`${style.itemDetail} ${style.info}`}>حضور و غیاب برای هر ماه به صورت جداگانه محاسبه میشوند.</p>
            </>
          ) : 'کلاسی پیدا نشد'}
        </div>
        <div className={style.leftContItem}>
          <h3 className={style.title}>پرداخت شهریه</h3>
          <ul>
            <li>
              <p className={style.info}>وضعیت پرداخت</p>
              <h3 className={style.title}>{athleteInfo?.next_payment?.status === 'unpaid' ? 'پرداخت نشده' : 'پرداخت شده'}</h3>
            </li>
            <li>
              <p className={style.info}>پرداخت بعدی</p>
              <h3 className={style.title}>{athleteInfo?.next_payment?.status === 'unpaid' ? (
                toPersianDigits(athleteInfo?.next_payment?.due_date_jalali)
              ) : (
                'شما هیچ پرداختی ندارید'
              )}</h3>
            </li>
            <li>
              <p className={style.info}>بدهکاری شما</p>
              <h3 className={style.title}>{toPersianDigits(athleteInfo?.next_payment?.amount)} تومان</h3>
            </li>
          </ul>
          <p className={`${style.itemDetail} ${style.info}`}>شما فقط میتوانید وضعیت کلاس، حضور و پرداخت خودتون رو ببینید و همه‌ی تغییرات توسط مربی و مدیر انجام میگیرد.</p>
        </div>
      </div>
    </div>
  )
}

export default MyClassInfo
import React, { useEffect, useState } from 'react'
import style from './Courses.module.scss';
import api from '../../../hooks/api';
import { useSelector } from 'react-redux'
import CoursesCountCard from '../../../components/dashboards/courses/coursesCountCard/CoursesCountCard';
import { UilLaptop, UilUserCheck, UilPlay, UilClock  } from '@iconscout/react-unicons'
import FilterBar from '../../../components/dashboards/courses/filterBar/FilterBar';
import ClassCard from '../../../components/dashboards/courses/classCard/ClassCard';
import toPersianDigits from '../../../hooks/convertNumber';
import { useNavigate } from 'react-router-dom';

const Courses = () => {

  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const { user } = useSelector(
    state => state.auth
  )
  const navigate = useNavigate()

  const fetchCourses = async () => {
    try {
      const res = await api.get('/training/courses/');
      setCourses(res.data)
      console.log(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchEnrollment = async () => {
    try {
      const res = await api.get('/training/enrollment/')
      setEnrollments(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchCourses();
    fetchEnrollment();  
  }, [])


  return (
    <div className={style.courses}>
      <div className={style.container}>
        <div className={style.header}>
          <div className={style.pageTitle}>
            <h3>مدیریت کلاس ها</h3>
            <p>مدیریت کلاس ها و ورزشکاران</p>
          </div>
          {user.role === 'manager' && (
            <button>
              اضافه کردن کلاس +
            </button>
          )}
        </div>
        <div className={style.counterCard}>
          <CoursesCountCard
            icon={<UilLaptop  fill='#2f6bff'/>}
            iconColor='#e9f0ff'
            title='تعداد کلاس ها'
            number={courses.length}
          />
          <CoursesCountCard
            icon={<UilUserCheck fill='#39ff2f' />}
            iconColor='#e9ffeb'
            title='تعداد ورزشکاران'
            number={enrollments.length}
          />
          <CoursesCountCard
            icon={<UilPlay fill='#ff2fee' />}
            iconColor='#ffe9fe'
            title='کلاس های فعال'
            number={courses.filter(c => c.is_active === true).length}
          />
          <CoursesCountCard
            icon={<UilClock fill='#ff632fff' />}
            iconColor='#ffece9'
            title='تعداد ساعت در هفته'
            number='40'
          />
        </div>
        <FilterBar />
        <div className={style.classCard}>
          {courses.map((item, index) => {
            return (
              <ClassCard
                key={index}
                status={item.is_active ? 'active' : 'deactive'}
                title={item.title}
                coach={item.coach.full_name}
                age_ranges={item.age_ranges}
                gender={item.gender_label}
                students={item.enrollment_count}
                schedule={item.schedule ? toPersianDigits(item.schedule) : 'ایجاد نشده است!'}
                hours={item.session_duration}
                onView={() => navigate(`/dashboard/courses/${item.id}`)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Courses
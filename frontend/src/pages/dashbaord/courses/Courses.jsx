import React, { useEffect, useMemo, useState } from 'react'
import style from './Courses.module.scss';
import api from '../../../hooks/api';
import { useSelector } from 'react-redux'
import CoursesCountCard from '../../../components/dashboards/courses/coursesCountCard/CoursesCountCard';
import { UilLaptop, UilUserCheck, UilPlay, UilClock, UilImport, UilTimes} from '@iconscout/react-unicons'
import FilterBar from '../../../components/dashboards/courses/filterBar/FilterBar';
import ClassCard from '../../../components/dashboards/courses/classCard/ClassCard';
import toPersianDigits from '../../../hooks/convertNumber';
import { useNavigate } from 'react-router-dom';
import { hasRole } from '../../../hooks/roleConverter';

const Courses = () => {

  const [courses, setCourses] = useState([])
  const [dashboard, setDasboard] = useState([])
  const { user } = useSelector(
    state => state.auth
  )
  const navigate = useNavigate()


  const [searchText, setSearchText] = useState('')
  const [dayFilter, setDayFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState('both');

  const fetchCourses = async () => {
    try {
      const res = await api.get('/training/courses/');
      setCourses(res.data)
      console.log(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/training/courses/dashboard/')
      console.log(res.data)
      setDasboard(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchCourses();
    fetchDashboard();  
  }, [])

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase()

    return courses.filter((row) => {

      const matchGenderFilter = 
        genderFilter === "both" || row.gender === genderFilter;
      
      const matchDaysFilter =
        dayFilter === 'all' || row.days_group === dayFilter;

      const name = (row.title || "").toLowerCase()
      const matchesSearch = 
        q === "" || name.includes(q);
      

      return matchesSearch && matchGenderFilter && matchDaysFilter;
    })
  }, [courses, searchText, genderFilter, dayFilter]);

  const handleClearFilter = () => {
    setSearchText('');
    setDayFilter('all');
    setGenderFilter('both');
  }


  return (
    <div className={style.courses}>
      <div className={style.container}>
        <div className={style.header}>
          <div className={style.pageTitle}>
            <h3>مدیریت کلاس ها</h3>
            <p>مدیریت کلاس ها و ورزشکاران</p>
          </div>
          {hasRole(user.roles, 'manager') && (
            <button onClick={() => navigate('/dashboard/courses/add')}>
              اضافه کردن کلاس +
            </button>
          )}
        </div>
        <div className={style.counterCard}>
          <CoursesCountCard
            icon={<UilLaptop  fill='#2f6bff'/>}
            iconColor='#e9f0ff'
            title='تعداد کلاس ها'
            number={dashboard.total_courses}
          />
          <CoursesCountCard
            icon={<UilUserCheck fill='#39ff2f' />}
            iconColor='#e9ffeb'
            title='تعداد ورزشکاران فعال'
            number={`${dashboard.total_enrollments} نفر`}
          />
          <CoursesCountCard
            icon={<UilPlay fill='#ff2fee' />}
            iconColor='#ffe9fe'
            title='کلاس های فعال'
            number={dashboard.active_courses}
          />
          <CoursesCountCard
            icon={<UilClock fill='#ff632fff' />}
            iconColor='#ffece9'
            title='تعداد ساعت در هفته'
            number={`${dashboard.weekly_hours} ساعت`}
          />
        </div>
        {/* <FilterBar /> */}
        <div className={style.toolbar}>
          <div className={style.filterObj}>
            <button> <UilImport /> </button>

            <label htmlFor="">جنسیت: </label>
            <select
              value={genderFilter}
              onChange={e => {
                setGenderFilter(e.target.value);
              }}
            >
              <option value="both">فرقی ندارد</option>
              <option value="male">آقایان</option>
              <option value="female">بانوان</option>
            </select>
          </div>
          <div className={style.filterObj}>
            <label htmlFor="">انتخاب روز: </label>
            <select
              value={dayFilter}
              onChange={e => {
                setDayFilter(e.target.value);
              }}
            >
              <option value="all">همه روزه</option>
              <option value="even">روزهای زوج</option>
              <option value="odd">روزهای فرد</option>
            </select>
          </div>

          <div className={style.inputWrapper}>
            <input
              placeholder="جستجوی کلاس..."
              value={searchText}
              className={style.searchInput}
              onChange={e => {
                setSearchText(e.target.value);
              }}
            />
            { searchText && (
              <span className={style.clearSearch} onClick={() => setSearchText("")}><UilTimes /></span>
            )}
          </div>
          <button className={style.clearFilterBtn} onClick={() => handleClearFilter()}>
            <UilTimes />
          </button>
        </div>

        <div className={style.classCard}>
          {filteredRows.length !== 0 ? (
            filteredRows.map((item, index) => {
            return (
              <ClassCard
                key={index}
                status={item.is_active ? 'active' : 'deactive'}
                title={item.title}
                coach={item.coach.full_name}
                age_ranges={item.age_ranges}
                gender={item.gender_label}
                students={item.active_students}
                schedule={item.schedule ? toPersianDigits(item.schedule) : 'ایجاد نشده است!'}
                hours={item.session_duration}
                class_status={item.class_status}
                onView={() => navigate(`/dashboard/courses/${item.id}`)}
              />
            )
          })
          ) : (
            <p>کلاسی پیدا نشد!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Courses
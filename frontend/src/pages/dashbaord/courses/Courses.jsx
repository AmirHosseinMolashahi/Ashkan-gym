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
import Pagination from '../../../components/GlobalComponents/Pagination/Pagination';
import BackButton from '../../../components/dashboards/backButton/BackButton';

const Courses = () => {

  const [courses, setCourses] = useState([])
  const [dashboard, setDasboard] = useState([])
  const { user } = useSelector(
    state => state.auth
  )
  const navigate = useNavigate()

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);


  const [searchText, setSearchText] = useState('')
  const [dayFilter, setDayFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState('both');

  const fetchCourses = async (
    url = '/training/courses/'
  ) => {
    try {
      let finalUrl = url;

      if (url.startsWith("http")) {
        const parsed = new URL(url);
        finalUrl = `${parsed.pathname}${parsed.search}`;
      }

      const res = await api.get(finalUrl);
      setCourses(res.data.results)

      setPage(res.data.current_page);
      setTotalPages(res.data.total_pages);
      setTotalCount(res.data.count);

      setNextPage(res.data.next);
      setPrevPage(res.data.previous);
      console.log(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const buildActivityUrl = (pageNumber = 1) => {
    const params = new URLSearchParams();

    params.append("page", pageNumber);

    if (searchText.trim()) {
      params.append("search", searchText);
    }

    // gender
    if (genderFilter !== "both") {
      params.append("gender", genderFilter);
    }

    // days
    if (dayFilter !== "all") {
      params.append("days_group", dayFilter);
    }

    return `/training/courses/?${params.toString()}`;
  };

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
    fetchDashboard();  
  }, [])

  
  useEffect(() => {
    fetchCourses(buildActivityUrl(page));  
  }, [searchText, dayFilter, genderFilter, page])

  // const filteredRows = useMemo(() => {
  //   const q = searchText.trim().toLowerCase()

  //   return courses.filter((row) => {

  //     const matchGenderFilter = 
  //       genderFilter === "both" || row.gender === genderFilter;
      
  //     const matchDaysFilter =
  //       dayFilter === 'all' || row.days_group === dayFilter;

  //     const name = (row.title || "").toLowerCase()
  //     const matchesSearch = 
  //       q === "" || name.includes(q);
      

  //     return matchesSearch && matchGenderFilter && matchDaysFilter;
  //   })
  // }, [courses, searchText, genderFilter, dayFilter]);

  const handleClearFilter = () => {
    setSearchText('');
    setDayFilter('all');
    setGenderFilter('both');
  }


  return (
    <div className={style.courses}>
      <div className={style.container}>
          <BackButton route='/dashboard' title='بازگشت' />
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
            <label htmlFor="">جنسیت: </label>
            <select
              value={genderFilter}
              onChange={e => {
                setGenderFilter(e.target.value);
              }}
            >
              <option value="both">جنسیت: فرقی ندارد</option>
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
              <option value="all">روزها: همه روزه</option>
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
            حذف فیلتر<UilTimes />
          </button>
        </div>

        <div className={style.classCardContainer}>
          {courses.length !== 0 ? (
            <>
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
                      students={item.active_students}
                      schedule={item.schedule ? toPersianDigits(item.schedule) : 'ایجاد نشده است!'}
                      hours={item.session_duration}
                      class_status={item.class_status}
                      onView={() => navigate(`/dashboard/courses/${item.id}`)}
                    />
                  )
              })}
              </div>
              <div className={style.paginationWrapper}>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onNext={() => {
                    if (nextPage) {
                      fetchCourses(nextPage);
                    }
                  }}
                  onPrev={() => {
                    if (prevPage) {
                      fetchCourses(prevPage);
                    }
                  }}
                  onPageChange={(pageNumber) => {
                    setPage(pageNumber);
                  }}
                />
              </div>
            </>
          ) : (
            <p>کلاسی پیدا نشد!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Courses
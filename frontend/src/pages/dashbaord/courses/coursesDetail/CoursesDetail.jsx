import React, { useEffect, useState } from 'react'
import style from './CoursesDetail.module.scss';
import { UilEdit, UilUserPlus, UilClockFive, UilCalendar, UilUsersAlt, UilCheckSquare, UilCreditCard } from '@iconscout/react-unicons'
import StudentsSection from '../../../../components/dashboards/courses/studentsTable/StudentsSection';
import api from '../../../../hooks/api';
import { useParams } from 'react-router-dom'
import Modal from '../../../../components/GlobalComponents/Modal/Modal';
import { useToast } from '../../../../context/NotificationContext';
import AttendanceTable from '../../../../components/dashboards/courses/attendanceTable/AttendanceTable';

const CoursesDetail = () => {

  const { id } = useParams()
  const [ courseDetail, setCourseDetail ] = useState(null)
  const [ courseStudents, setCourseStudents ] = useState([])
  const [ courseSession, setCourseSession ] = useState([])
  const [ addStudentModal, setAddStudentsModal ] = useState(false)
  const [ athletes, setAthletes ] = useState([])
  const [ activeTab, setActiveTab] = useState(1)

  const { notify } = useToast()

  const fetchCourseDetail = async () => {
    try {
      const res = await api.get(`/training/courses/detail/${id}/`);
      setCourseDetail(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchCourseStudentsList = async () => {
    try {
      const res = await api.get(`/training/courses/detail/${id}/students/`);
      setCourseStudents(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchCourseSessions = async () => {
    try {
      const res = await api.get(`/training/courses/detail/${id}/sessions/current-month/`);
      console.log(res.data)
      setCourseSession(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchAthletes = async () => {
    try {
      const res = await api.get('/training/athletes/')
      setAthletes(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchCourseDetail();
    fetchCourseStudentsList();
    fetchAthletes();
    fetchCourseSessions();
  }, [])


  const handleAddStudentsModal = () => {
    if (addStudentModal) {
      setSearchTerm('')
      setSelectedIds([])
    }
    setAddStudentsModal(!addStudentModal)
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // فیلتر کردن لیست بر اساس نام یا آیدی
  const filteredStudents = athletes.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.national_id.includes(searchTerm)
  );

  const toggleStudent = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddEnrollments = async () => {
    const hasDuplicate = courseStudents.some(student =>
      selectedIds.includes(student.student.id)
    )

    if (hasDuplicate) {
      notify('برخی از ورزشکاران قبلاً اضافه شده‌اند', 'error')
      return null;
    }

    try {
      await api.post('/training/enrollment/add/', {
        course: Number(id),
        students: selectedIds.map(Number)
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      notify('اضافه کردن ورزشکار با موفقیت انجام شد!', 'success')
      fetchCourseStudentsList();
      handleAddStudentsModal()
    } catch (err) {
      console.log(err)
      notify('خطا در اضافه کردن ورزشکار', 'error')
    }
  }
  return (
    <div className={style.coursesDetail}>
      <div className={style.container}>
        <div className={style.header}>
          <div className={style.headerContainer}>
            <div className={style.topHeader}>
              <h1>{courseDetail?.title}</h1>
              <div className={style.btnContainer}>
                <button className={style.addUser} onClick={() => handleAddStudentsModal()} >
                  {addStudentModal ? (
                    <>در حال اضافه کردن...</>
                  ) : (
                    <>اضافه کردن ورزشکار <UilUserPlus /></>
                  )}
                </button>
                <button className={style.editClass}><UilEdit /></button>
              </div>
            </div>
            <p>
              {courseDetail?.age_ranges.map((item, index) => {
                return(
                  <span key={index}>{item.title} </span>
                )
              })} - 
              {courseDetail?.gender_label} - 
              {courseDetail?.class_status === 'public' ? 'عمومی' : 'خصوصی'}
            </p>
            <div className={style.mainHeader}>
              <ul>
                <li>
                  <p>تعداد ورزشکاران</p>
                  <h1>{courseStudents.length}</h1>
                </li>
                <li>
                  <p>شهریه کلاس</p>
                  <h1>{courseDetail?.price}</h1>
                </li>
                <li>
                  <p>میانگین حضور در کلاس</p>
                  <h1>75%</h1>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={style.cardContainer}>
          <div className={style.detailCard}>
            <h3>
              زمان بندی کلاس
            </h3>
            <div className={style.detailCardcontent}>
              <ul className={style.timeList}>
                <li>
                  <UilCalendar />
                  <p>شنبه - دوشنبه - چهارشنبه</p>
                </li>
                <li>
                  <UilClockFive />
                  <p>از 17:45 تا 19:00</p>
                </li>
              </ul>
            </div>
          </div>
          <div className={style.detailCard}>
            <h3>
              وضعیت پرداخت شهریه
            </h3>
            <div className={style.detailCardcontent}>
              <ul className={style.payList}>
                <li>
                  <p>تعداد پرداختی این ماه</p>
                  <p className={style.paid}>9</p>
                </li>
                <li>
                  <p>در انتظار پرداخت</p>
                  <p className={style.pending}>4</p>
                </li>
                <li>
                  <p>شهریه عقب افتاده</p>
                  <p className={style.unpaid}>3</p>
                </li>
              </ul>
              <div className={style.progressWrapper}>
                <div
                  className={style.progressBar}
                  style={{ width: `65%` }}
                />
              </div>
            </div>
          </div>
          <div className={style.detailCard}>
            <h3>
              جلسه بعدی
            </h3>
            <div className={style.detailCardcontent}>
              <ul className={style.nextSession}>
                <li className={style.date}>
                  <h1>چهارشنبه</h1>
                  <p>11 دی</p>
                </li>
                <li className={style.time}>
                  <p>از 17:45 تا 19:00</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className={style.tabWrapper}>
          <div className={style.tabs}>
            <ul>
              <li className={activeTab === 1 ? style.active : ''} onClick={() => setActiveTab(1)}>
                <UilUsersAlt />
                ورزشکاران ({courseStudents.length})
              </li>
              <li className={activeTab === 2 ? style.active : ''} onClick={() => setActiveTab(2)}>
                <UilCheckSquare />
                حضور و غیاب
              </li>
              <li className={activeTab === 3 ? style.active : ''} onClick={() => setActiveTab(3)}>
                <UilCreditCard />
                شهریه
              </li>
            </ul>
          </div>
          { activeTab === 1 && (
            <StudentsSection students={courseStudents} />
          )}
          { activeTab === 2 && (
            <AttendanceTable students={courseStudents} sessions={courseSession} />
          )}
          { activeTab === 3 && (
            <p>payment</p>
          )}
        </div>
      </div>
      {addStudentModal && (
        <Modal handleModal={handleAddStudentsModal} height='600px' width='450px'>
          <div className={style.modalContent}>
            <h2>اضافه کردن ورزشکار</h2>
            <p className={style.subtitle}>جستجوی ورزشکار با نام یا کدملی...</p>

            <div className={style.searchWrapper}>
              <div className={style.serachContainer}>
                <span className={style.searchIcon}>🔍</span>
                <input 
                  type="text" 
                  placeholder="جستجو با نام یا کدملی..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className={style.resultsList}>
              <span className={style.label}>نتایج جستجو</span>
              {filteredStudents.map(student => (
                <div 
                  key={student.id} 
                  className={`${style.studentItem} ${selectedIds.includes(student.id) ? style.active : ''}`}
                  onClick={() => toggleStudent(student.id)}
                >
                  <img src={student.profile_picture} alt={student.full_name} />
                  <div className={style.info}>
                    <span className={style.name}>{student.full_name}</span>
                    <span className={style.id}>کدملی: {student.national_id}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(student.id)} 
                    readOnly 
                  />
                </div>
              ))}
            </div>

            <div className={style.footer}>
              <button className={style.cancelBtn} onClick={handleAddStudentsModal}>لغو</button>
              <button className={style.addBtn} disabled={selectedIds.length === 0} onClick={() => handleAddEnrollments()}>
                اضافه کردن ({selectedIds.length})
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default CoursesDetail
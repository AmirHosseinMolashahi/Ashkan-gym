import React, { useEffect, useState } from 'react'
import style from './CoursesDetail.module.scss';
import { UilEdit, UilUserPlus, UilClockFive, UilCalendar, UilUsersAlt, UilCheckSquare, UilCreditCard } from '@iconscout/react-unicons'
import StudentsSection from '../../../../components/dashboards/courses/studentsTable/StudentsSection';
import api from '../../../../hooks/api';
import { useParams } from 'react-router-dom'
import Modal from '../../../../components/GlobalComponents/Modal/Modal';
import { useToast } from '../../../../context/NotificationContext';
import AttendanceTable from '../../../../components/dashboards/courses/attendanceTable/AttendanceTable';
import { useSelector } from 'react-redux';
import AddTimeTable from '../../../../components/dashboards/courses/addTimeTable/AddTimeTable';
import { useNavigate } from 'react-router-dom';

const CoursesDetail = () => {

  const { id } = useParams()
  const [ courseDetail, setCourseDetail ] = useState(null)
  const [ courseStudents, setCourseStudents ] = useState([])
  const [ addStudentModal, setAddStudentsModal ] = useState(false)
  const navigate = useNavigate();

  const initialSchedule = [
    { id: 1, day: 'شنبه', enabled: false, start: '', end: '' },
    { id: 2, day: 'یکشنبه', enabled: false, start: '', end: '' },
    { id: 3, day: 'دوشنبه', enabled: false, start: '', end: '' },
    { id: 4, day: 'سه شنبه', enabled: false, start: '', end: '' },
    { id: 5, day: 'چهارشنبه', enabled: false, start: '', end: '' },
    { id: 6, day: 'پنچ شنبه', enabled: false, start: '', end: '' },
    { id: 7, day: 'جمعه', enabled: false, start: '', end: '' },
  ];
  
  const [ addTimeTableModal, setAddTimeTableModal ] = useState(false)
  const [scheduleRows, setScheduleRows] = useState(initialSchedule);



  const [ athletes, setAthletes ] = useState([])
  const [ activeTab, setActiveTab] = useState(1)
  const { user } = useSelector(
      state => state.auth
    )

  const { notify } = useToast()

  const fetchCourseDetail = async () => {
    try {
      const res = await api.get(`/training/courses/detail/${id}/`);
      console.log(res.data)
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


  const handleSaveSchedule = async () => {
    const payload = scheduleRows
      .filter((r) => r.enabled)
      .map((r) => ({
        day_id: r.id,
        day: r.day,
        start_time: r.start ? r.start.format("HH:mm") : "",
        end_time: r.end ? r.end.format("HH:mm") : "",
      }));
    
    try {
      await api.post(`/training/courses/${id}/timetable/bulk-create/`, payload);
      notify('جدول زمانی با موفقیت ایجاد شد!', 'success')
      setAddTimeTableModal(false);
      fetchCourseDetail();
    } catch (err) {
      console.log(err)
      if (err.response?.data?.detail) {
        notify(err.response?.data?.detail, 'error')
      } else {
        notify('خطا در ایجاد جدول زمانی!', 'error')
      }
    }
  };

  const nextSession = courseDetail?.next_session;
  const paymentStatus = courseDetail?.payment_status;

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
                <button className={style.editClass} onClick={() => navigate(`/dashboard/courses/${id}/edit`)}>
                  <UilEdit />
                </button>
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
                  <h1>{courseDetail?.attendance_percentage_month ?? 0}%</h1>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={style.cardContainer}>
          <div className={style.detailCard}>
            <h3>
              زمان بندی کلاس <span>{user.role === 'manager' ? (
                <button><UilEdit /></button>
              ) : (
                ''
              )}</span>
            </h3>
            <div className={style.detailCardcontent}>
              {courseDetail?.timeTable.length !== 0 ? (
                <div className={style.detailCardWrapper}>
                  <ul className={style.timeList}>
                    <li>
                      <UilCalendar />
                      <p>{courseDetail?.timeTable?.map(item => (item.day_label + ' '))}</p>
                    </li>
                    <li>
                      <UilClockFive />
                      <p>{courseDetail?.timeTable[0]?.start_time} تا {courseDetail?.timeTable[0]?.end_time}</p>
                    </li>
                  </ul>
                </div>
              ) : (
                user.role === 'manager' ? (
                  <button className={style.addTimeTableBtn} onClick={() => setAddTimeTableModal(true)}>
                    ایجاد جدول زمانی +
                  </button>
                ) : (
                  <p>جدول زمانی ایجاد نشده است!</p>
                )
              )}
            </div>
          </div>
          <div className={style.detailCard}>
            <h3>
              وضعیت پرداخت شهریه
            </h3>
            <div className={style.detailCardcontent}>
              <div className={style.detailCardWrapper}>
                <ul className={style.payList}>
                  <li>
                    <p>تعداد پرداختی این ماه</p>
                    <p className={style.paid}>{paymentStatus?.paid_count ?? 0}</p>
                  </li>
                  <li>
                    <p>در انتظار پرداخت</p>
                    <p className={style.pending}>{paymentStatus?.partially_paid_count ?? 0}</p>
                  </li>
                  <li>
                    <p>شهریه عقب افتاده</p>
                    <p className={style.unpaid}>{paymentStatus?.overdue_count ?? 0}</p>
                  </li>
                </ul>
                <div className={style.progressWrapper}>
                  <div
                    className={style.progressBar}
                    style={{ width: `${paymentStatus?.paid_percent ?? 0}%` }}
                  />
                </div>
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
                  <h1>{nextSession?.day_of_week ?? '—'}</h1>
                  <p>{nextSession?.date_jalali ?? 'جلسه‌ای ثبت نشده'}</p>
                </li>
                <li className={style.time}>
                  <p>
                    از {nextSession?.start_time?.slice(0, 5) ?? '--:--'} تا {nextSession?.end_time?.slice(0, 5) ?? '--:--'}
                  </p>
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
            <AttendanceTable course_id={id} />
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

      {addTimeTableModal && (
        <AddTimeTable 
          addTimeTamleModal={addTimeTableModal}
          setAddTimeTableModal={setAddTimeTableModal}
          handleSaveSchedule={() => handleSaveSchedule}
          scheduleRows={scheduleRows}
          setScheduleRows={setScheduleRows}/>
      )}
    </div>
  )
}

export default CoursesDetail
import React, { useEffect, useMemo, useState } from "react";
import styles from "./AttendanceStatus.module.scss";
import api from "../../../../hooks/api";
import Pagination from "../../../GlobalComponents/Pagination/Pagination";
import toPersianDigits from "../../../../hooks/convertNumber";
import MonthListSkeleton from "./monthListSkeleton/MonthListSkeleton";

const AttendanceStatus = ({ myClasses }) => {

  const [classAttendanceList, setClassAttendanceList] = useState([])
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null)
  const [availableYearsMonths, setAvailableYearsMonths] = useState({ years: [], months: [] });
  const [pagination, setPagination] = useState({
    count: 0,
    total_pages: 1,
    current_page: 1,
    next_page: '',
    prev_page: ''
  });

  const [loading, setLoading] = useState(false)

  const filteredMonths = selectedYear
    ? availableYearsMonths.months?.filter(m => m.year === Number(selectedYear)) || []
    : availableYearsMonths.months || [];


  const handleCourseChange = async (e) => {
    if (e.target.value === 'empty') {
      setSelectedCourseId(null);
      setClassAttendanceList([]);
      setSelectedYear('');
      setSelectedMonth('');
      setAvailableYearsMonths([]);
    } else {
      setSelectedClass(myClasses.find(item => 
        item.course.id === Number(e.target.value)
      ))
      setSelectedCourseId(e.target.value);
      setClassAttendanceList([]);
      setSelectedYear('');
      setSelectedMonth('');
      
      // فقط سال/ماه های موجود رو بگیر
      const res = await api.get(`/training/my-classes/${e.target.value}/attendance/available-months/`);
      console.log(res.data)
      setAvailableYearsMonths(res.data);
    }
  };

  // اعمال فیلتر

  const fetchAttendanceSummaryList = async (
    url = `training/my-classes/${selectedCourseId}/attendance/monthly-summary/`
  ) => {
    try {
      setLoading(true)
      let finalUrl = url;

      if (url.startsWith("http")) {
        const parsed = new URL(url);
        finalUrl = `${parsed.pathname}${parsed.search}`;
      }

      const res = await api.get(finalUrl);

      console.log(res.data)
      setClassAttendanceList(res.data.results);  // قبلاً months بود، الان results
      setPagination({
          count: res.data.count,
          total_pages: res.data.total_pages,
          current_page: res.data.current_page,
          next_page: res.data.next,
          prev_page: res.data.previous,
      });
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const buildActivityUrl = (pageNumber = 1) => {
    const params = new URLSearchParams();

    params.append("page", pageNumber);
    if (selectedYear) params.append('year', selectedYear);
    if (selectedMonth) params.append('month', selectedMonth);

    return `training/my-classes/${selectedCourseId}/attendance/monthly-summary/?${params.toString()}`;
  };

  const handleApply = async (pageNumber = 1) => {
    fetchAttendanceSummaryList(buildActivityUrl(pageNumber))  
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.leftContainer}>
          <h1>وضعیت حضور و غیاب</h1>
          <p className={styles.subtitle}>
            یک کلاس انتخاب کنید تا وضعیت حضور و غیاب را ببینید.
          </p>

          <div className={styles.filter}>
            <select
              className={`${styles.select} ${styles.classSelect}`}
              onChange={handleCourseChange}
            >
              <option value='empty'>--------------</option>
              {myClasses?.map((item, index) => (
                <option key={index} value={item.course.id}>
                  {item.course.title} - {item.course.age_ranges.map(i => i.title + ' ')} - مربی: {item.course.coach.full_name}
                </option>
              ))}
            </select>

            <div className={styles.row}>
              <select
                className={styles.select}
                value={selectedYear}
                onChange={e => { setSelectedYear(e.target.value); setSelectedMonth(''); }}
                disabled={!selectedCourseId}
              >
                <option value=''>انتخاب سال</option>
                {availableYearsMonths?.years?.map(year => (
                  <option key={year} value={year}>{toPersianDigits(year)}</option>
                ))}
              </select>

              <select
                className={styles.select}
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                disabled={!selectedYear}
              >
                <option value=''>انتخاب ماه</option>
                {filteredMonths.map(m => (
                  <option key={`${m.year}-${m.month}`} value={m.month}>
                    {toPersianDigits(m.month_name)}
                  </option>
                ))}
              </select>
            </div>

            <button className={styles.submitBtn} onClick={() => handleApply(1)} disabled={!selectedCourseId}>
              اعمال
            </button>
          </div>

          <div className={styles.card}>
            <h2>حضور و غیاب ماهانه</h2>
            <p className={styles.smallText}>
              وضعیت حضور شما در هر ماه
            </p>

            <div className={styles.monthList}>
              {loading === true ? (
                <MonthListSkeleton />
              ) : (
                classAttendanceList.length !== 0 ? (
                  <>
                {classAttendanceList?.map((item, index) => (
                  <div key={index} className={styles.monthItem}>
                    <div>
                      <h3>{toPersianDigits(item.month_name)}</h3>
                      <p>
                        {toPersianDigits(item.total_sessions)} جلسه - {toPersianDigits(item.present_count)} جلسه حاضر
                      </p>
                    </div>
                    <span
                      className={`${styles.badge} ${
                        styles[item.attendance_percentage_status]
                      }`}
                    >
                      {item.attendance_percentage_status === "excellent"
                        ? "عالی"
                        : item.attendance_percentage_status === "good"
                        ? "خوب"
                        : "نیاز به توجه بیشتر"}
                    </span>
                  </div>
                ))}
                {pagination.total_pages > 1 && (
                  <div className={styles.paginationWrapper}>
                  <Pagination 
                    currentPage={pagination.current_page}
                    totalPages={pagination.total_pages}
                    onNext={() => {
                      if (pagination.next_page) {
                        fetchAttendanceSummaryList(pagination.next_page);
                      }
                    }}
                    onPrev={() => {
                      if (pagination.prev_page) {
                        fetchAttendanceSummaryList(pagination.prev_page);
                      }
                    }}
                    onPageChange={(pageNumber) => {
                      handleApply(pageNumber);
                    }}
                  />
                </div>
                )}
                </>
                ) : (
                  <p>هیچ کلاسی انتخاب نشده است!!!</p>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.summaryCard}>
          <h2>گزارش حضور و غیاب</h2>
          <p className={styles.smallText}>
            برای هر کلاس و هر ماه به صورت مجزا
          </p>

          <div className={styles.profile}>
            <div className={styles.avatar}>
              <img src={selectedClass ? selectedClass.course.avatar : ''} alt="" />
            </div>
            <div>
              <h4>{selectedClass ? selectedClass.course.title : 'کلاسی انتخاب نشده است.'}</h4>
              <p>عضویت از: {selectedClass ? toPersianDigits(selectedClass.joined_at_jalali.split(' ', 1)) : ''}</p>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.statBox}>
              <h3>{selectedClass ? `${toPersianDigits(selectedClass.attendance_percentage)} %` : '--'}</h3>
              <p>درصد حضور در کلاس</p>
            </div>
            <div className={styles.statBox}>
              <h3>{toPersianDigits(myClasses.length)}</h3>
              <p>تعداد کلاس های شما</p>
            </div>
          </div>

          <ul className={styles.legend}>
            <li>{toPersianDigits('عالی: + 84 درصد حضور')}</li>
            <li>{toPersianDigits('خوب: 60 تا 84 درصد حضور')}</li>
            <li>{toPersianDigits('نیاز به توجه بیشتر: کمتر از 60 درصد حضور')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStatus;

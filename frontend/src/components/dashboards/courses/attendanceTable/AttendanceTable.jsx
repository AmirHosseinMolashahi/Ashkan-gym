import { useState, useMemo, useEffect } from "react";
import styles from "./AttendanceTable.module.scss";
import { UilFilter, UilCheck, UilTimes, UilClock } from '@iconscout/react-unicons'
import toPersianDigits from "../../../../hooks/convertNumber";
import api from "../../../../hooks/api";
import useCurrentDateTime from "../../../../hooks/currentDateTime";
import { useToast } from "../../../../context/NotificationContext";
import AttendanceToolbar from "./AttendanceToolbar";
import AttendanceRow from "./AttendanceRow";
import AttendanceCard from "./attendanceCard/AttendanceCard";
import Pagination from "../../../GlobalComponents/Pagination/Pagination";
import AttendanceTableSkeleton from "./attendanceRowSkeleton/AttendanceTableSkeleton";
import AttendanceCardSkeleton from "./attendanceCard/attendanceCardSkeleton/AttendanceCardSkeleton";

const PAGE_SIZE = 10;

export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoint
  );

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const handler = (e) => setIsMobile(e.matches);

    media.addEventListener("change", handler);

    return () => media.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
};

const AttendanceTable = ({ course_id }) => {
  const [ sessions, setSessions ] = useState([])
  const [ students, setStudents ] = useState([])
  const [ search, setSearch] = useState("");
  const [ paymentFilter, setPaymentFilter] = useState("all");
  const [ page, setPage] = useState(1);
  const [ sessionAttendance, setSessionAttendance ] = useState([])
  const [ selectedSession, setSelectedSession ] = useState(null)
  const { notify } = useToast()
  const {date, weekday, month} = useCurrentDateTime()
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false)

  const monthFromDate = Number(
    date.split('/')[1].replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
  );
  const yearFromDate = Number(
    date.split('/')[0].replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
  );

  const [ selectedMonth, setSelectedMonth ] = useState(monthFromDate)

  const filteredData = useMemo(() => {
    return sessionAttendance.filter(s => {
      const fullName =
        s.student_name ||
        `${s.student_name || ""}`.trim();
      const email = s.student.email || "";

      const matchSearch =
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());

      return matchSearch;
    });
  }, [sessionAttendance, search]);


  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return filteredData.slice(start, end);
  }, [filteredData, page]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedSession]);

  const fetchCourseSessions = async (month_id = selectedMonth) => {
    try {
      const res = await api.get(`/training/session/${course_id}/?year=${yearFromDate}&month=${month_id}`);
      console.log(res.data)
      setSessions(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchSessionAttendance = async (id) => {
    try {
      setLoading(true)
      const res = await api.get(`/training/session/${id}/attendance/`);
      console.log(res.data)
      setSessionAttendance(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchCourseSessions();
  }, [])

  const selectedSessionObject = useMemo(() => {
    return sessions.find(s => s.id === Number(selectedSession));
  }, [selectedSession, sessions]);


  const updateAttendanceItem = (studentId, updates) => {
    setSessionAttendance(prev =>
      prev.map(item =>
        item.student === studentId
          ? { ...item, ...updates }
          : item
      )
    );
  };

  const handleStatusChange = (studentId, newStatus) => {
    updateAttendanceItem(studentId, { status: newStatus });
  };

  const handleNoteChange = (studentId, newNote) => {
    updateAttendanceItem(studentId, { note: newNote });
  };

  const handleAllStatusChange = (params) => {
    const newStatus =
      params === 'p' ? 'present' :
      params === 'l' ? 'late' :
      'absent';
    setSessionAttendance(prev =>
      prev.map(item => ({
        ...item,
        status: newStatus,
      }))
    );
  }


  const submitAttendance = async () => {
    try {
      const payload = sessionAttendance.map(item => ({
        student: item.student,
        status: item.status,
        note: item.note || ""
      }));

      await api.put(
        `/training/session/${selectedSession}/attendance/bulk/`,
        payload
      );

      notify('حضور و غیاب با موفقیت ثبت شد!', 'success');
      fetchCourseSessions();
    } catch (err) {
      console.log(err);
      notify('حضور و غیاب ثبت نشد!!', 'error');
    }
  };


  
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
      <AttendanceToolbar
        sessions={sessions}
        selectedSession={selectedSession}
        setSelectedSession={setSelectedSession}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        fetchCourseSessions={fetchCourseSessions}
        fetchSessionAttendance={fetchSessionAttendance}
        search={search}
        setSearch={setSearch}
        sessionAttendance={sessionAttendance}
        selectedSessionObject={selectedSessionObject}
        submitAttendance={submitAttendance}
        handleAllStatusChange={handleAllStatusChange}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        setPage={setPage}
        setSessionAttendance={setSessionAttendance}
      />

        {isMobile ? (
          loading === true ? (
            <div className={styles.cardContainer}>
              {Array.from({ length: 5 }).map((_, i) => (
                <AttendanceCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AttendanceCard
              data={paginatedData}
              onStatusChange={handleStatusChange}
              onNoteChange={handleNoteChange}
            />
          )
        ) : (
          loading === true ? (
            <AttendanceTableSkeleton />
          ) : (
            paginatedData.length === 0 ? (
              <p>هیچ جلسه ای انتخاب نشده است!</p>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ردیف</th>
                      <th>ورزشکار</th>
                      <th>حضور غیاب</th>
                      <th>توضیحات</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData?.map((item, index) => (
                      <AttendanceRow
                        key={item.student ?? index}
                        item={item}
                        index={(page - 1) * PAGE_SIZE + index}
                        onStatusChange={handleStatusChange}
                        onNoteChange={handleNoteChange}
                      />
                    ))}
                  </tbody> 
                </table>
              </div>
            )
          )
          
        )}

        {totalPages > 1 && (
          <div className={styles.paginationWrapper}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onNext={() =>
                setPage(prev => Math.min(prev + 1, totalPages))
              }
              onPrev={() =>
                setPage(prev => Math.max(prev - 1, 1))
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceTable;
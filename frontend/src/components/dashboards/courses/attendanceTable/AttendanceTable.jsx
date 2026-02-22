import { useState, useMemo, useEffect } from "react";
import styles from "./AttendanceTable.module.scss";
import { UilFilter, UilCheck, UilTimes, UilClock } from '@iconscout/react-unicons'
import toPersianDigits from "../../../../hooks/convertNumber";
import api from "../../../../hooks/api";
import useCurrentDateTime from "../../../../hooks/currentDateTime";
import { useToast } from "../../../../context/NotificationContext";
import AttendanceToolbar from "./AttendanceToolbar";
import AttendanceRow from "./AttendanceRow";

const PAGE_SIZE = 5;

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
        s.student.full_name ||
        `${s.student.first_name || ""} ${s.student.last_name || ""}`.trim();
      const email = s.student.email || "";

      const matchSearch =
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());

      const matchPayment =
        paymentFilter === "all" || s.paymentStatus === paymentFilter;

      return matchSearch && matchPayment;
    });
  }, [sessionAttendance, search, paymentFilter]);

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
      const res = await api.get(`/training/session/${id}/attendance/`);
      console.log(res.data)
      setSessionAttendance(res.data)
    } catch (err) {
      console.log(err)
    }
  };

  useEffect(() => {
    fetchCourseSessions();
  }, [])

  const selectedSessionObject = useMemo(() => {
    return sessions.find(s => s.id === Number(selectedSession));
  }, [selectedSession, sessions]);

  // const handleStatusChange = (studentId, newStatus) => {
  //   setSessionAttendance(prev =>
  //     prev.map(item =>
  //       item.student === studentId
  //         ? { ...item, status: newStatus }
  //         : item
  //     )
  //   );
  // };
  
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

        {/* Table */}
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
              {sessionAttendance?.map((item, index) => (
                <AttendanceRow
                  key={item.student ?? index}
                  item={item}
                  index={index}
                  onStatusChange={handleStatusChange}
                  onNoteChange={handleNoteChange}
                />
              ))}
            </tbody> 
          </table>
        </div>

        {/* //Pagination
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={page === i + 1 ? styles.activePage : ""}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div> */}
      </div>
    </div>
  );
}

export default AttendanceTable;
import { useState, useMemo, useEffect } from "react";
import styles from "./AttendanceTable.module.scss";
import { UilFilter, UilCheck, UilTimes, UilClock } from '@iconscout/react-unicons'
import toPersianDigits from "../../../../hooks/convertNumber";
import api from "../../../../hooks/api";

const PAGE_SIZE = 5;

const AttendanceTable = ({ sessions }) => {
  const [ students, setStudents ] = useState([])
  const [ search, setSearch] = useState("");
  const [ paymentFilter, setPaymentFilter] = useState("all");
  const [ page, setPage] = useState(1);
  const [ sessionAttendance, setSessionAttendance ] = useState([])

  const filteredData = useMemo(() => {
    return students.filter(s => {
      const matchSearch =
        s.student.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.student.email.toLowerCase().includes(search.toLowerCase());

      const matchPayment =
        paymentFilter === "all" || s.paymentStatus === paymentFilter;

      return matchSearch && matchPayment;
    });
  }, [students, search, paymentFilter]);

  const fetchSessionAttendance = async () => {
    try {
      const res = await api.get()
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchSessionAttendance();
  }, [])
  
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.left}>
            <button><UilFilter /> </button>
            <select
              value={paymentFilter}
              onChange={e => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">انتخاب جلسه تمرین</option>
              {sessions.map((item, index) => {
                return (
                  <option key={index} value={item.id}>{item.day_of_week} - {item.date_jalali}</option>
                )
              })}
            </select>
          </div>

        </div>
        <div className={styles.actionContainer}>
          <ul>
            <li>
              <input
                placeholder="جستجوی ورزشکار..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </li>
            <li>
              <button className={styles.present}>حاضری برای همه</button>
            </li>
            <li>
              <button className={styles.absent}>غیبت برای همه</button>
            </li>
            <li className={styles.endBtn}>
              <button className={styles.end}>اتمام حضور و غیاب</button>
            </li>
          </ul>
        </div>

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
              {students?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                     <div className={styles.students}>
                       <img src={item.student.profile_picture} />
                        <div>
                          <strong>{item.student.first_name} {item.student.last_name}</strong>
                          <p>{toPersianDigits(item.student.national_id)}</p>
                        </div>
                     </div>
                    </td>
                    <td>
                      <ul>
                        <li className={styles.present}><button>حاضر <UilCheck /></button></li>
                        <li className={styles.absent}><button>غایب <UilTimes /></button></li>
                        <li className={styles.late}><button>تاخیر <UilClock /></button></li>
                      </ul>
                    </td>
                    <td className={styles.note}>
                      <input type="text" placeholder="توضیحات"/>
                    </td>
                  </tr>
                )
              })}
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
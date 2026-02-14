import { useState, useMemo } from "react";
import styles from "./StudentsSection.module.scss";
import { UilImport, UilEye, UilEdit, UilTrashAlt } from '@iconscout/react-unicons'
import toPersianDigits from "../../../../hooks/convertNumber";

const PAGE_SIZE = 5;

export default function StudentsSection({ students }) {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);

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
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.left}>
            <button>استخراج <UilImport /> </button>

            <select
              value={paymentFilter}
              onChange={e => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">همه</option>
              <option value="Paid">پرداخت شده</option>
              <option value="Pending">در انتظار پرداخت</option>
              <option value="Overdue">از موئد گذشته</option>
            </select>
          </div>

          <input
            placeholder="جستجوی ورزشکار..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ردیف</th>
                <th>ورزشکار</th>
                <th>تلفن</th>
                <th>حضور غیاب</th>
                <th>وضعیت شهریه</th>
                <th>تغییرات</th>
              </tr>
            </thead>

            <tbody>
              {students.map((item, index) => {
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
                    <td>{toPersianDigits(item.student.phone_number)}</td>
                    <td>
                      <strong>{item.attendancePercent}%</strong>
                      <span className={styles.muted}>
                        ({item.attended}/{item.total})
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[item.paymentStatus]}`}>
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div className={styles.btnContainer}>
                        <button><UilEye fill='#3b82f6' /></button>
                        <button><UilEdit /></button>
                        <button><UilTrashAlt fill='#C1121F'/></button>
                      </div>
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

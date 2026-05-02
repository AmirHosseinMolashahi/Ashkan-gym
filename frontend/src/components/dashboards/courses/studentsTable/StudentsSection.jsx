import { useState, useMemo } from "react";
import styles from "./StudentsSection.module.scss";
import { UilImport, UilEye, UilEdit, UilTrashAlt, UilTimes, UilTimesCircle, UilCheckCircle, UilCheck } from '@iconscout/react-unicons'
import toPersianDigits from "../../../../hooks/convertNumber";
import useCurrentDateTime from "../../../../hooks/currentDateTime";
import { useNavigate } from 'react-router-dom';
import Modal from "../../../GlobalComponents/Modal/Modal";
import api from "../../../../hooks/api";
import { useToast } from "../../../../context/NotificationContext";

const PAGE_SIZE = 5;

export default function StudentsSection({ students, fetchStudent }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const {date, weekday, month} = useCurrentDateTime()
  const navigate = useNavigate();
  const [deactiveModal, setDeactiveModal] = useState(false)
  const [reactiveModal, setReactiveModal] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const { notify } = useToast();

  const handleDeactiveModal = (item) => {
    if (!deactiveModal) {
      setSelectedEnrollment(item);
    }
    setDeactiveModal(!deactiveModal)
  }


  const handleReactiveModal = (item) => {
    if (!reactiveModal) {
      setSelectedEnrollment(item);
    }
    setReactiveModal(!reactiveModal)
  }

  const handleDeactiveEnrollment = async () => {
    try {
      await api.post(`/training/courses/enrollment/${selectedEnrollment.id}/deactive/`);
      fetchStudent();
      setDeactiveModal(false);
      notify('غیرفعال کردن ورزشکار انجام شد.', 'success')
    } catch (err) {
      console.log(err)
      notify('خطا در غیرفعال کردن ورزشکار.', 'danger')
    }
  }


  const handleReactiveEnrollment = async () => {
    try {
      await api.post(`/training/courses/enrollment/${selectedEnrollment.id}/reactive/`);
      fetchStudent();
      setReactiveModal(false);
      notify('ورزشکار با موفقیت فعال شد.', 'success')
    } catch (err) {
      console.log(err)
      notify('خطا در فعال کردن ورزشکار.', 'danger')
    }
  }

  const filteredData = useMemo(() => {
    return students.filter(s => {
      const fullName =
        s.student.full_name ||
        `${s.student.first_name || ""} ${s.student.last_name || ""}`.trim();
      const email = s.student.email || "";

      const matchSearch =
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" || s.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [students, search, statusFilter]);
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.left}>
            <button> <UilImport /> </button>

            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
              }}
            >
              <option value="all">همه</option>
              <option value="active">فعال</option>
              <option value="deactive">غیرفعال</option>
            </select>
          </div>

          <div className={styles.inputWrapper}>
            <input
              placeholder="جستجوی ورزشکار..."
              value={search}
              className={styles.searchInput}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            { search && (
              <span className={styles.clearSearch} onClick={() => setSearch("")}><UilTimes /></span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ردیف</th>
                <th>ورزشکار</th>
                <th>وضعیت</th>
                <th>تلفن</th>
                <th>
                  <div className={styles.thDub}>
                    حضور غیاب
                    <span>({month} ماه)</span>
                  </div>
                </th>
                <th>
                  <div className={styles.thDub}>
                    وضعیت شهریه
                    <span>({month} ماه)</span>
                  </div>
                </th>
                <th>تغییرات</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item, index) => {
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
                    <td>{item.status === 'active' ? (
                      <span className={styles.status}>فعال <UilCheck /></span>
                    ) : (
                      <span className={styles.status}>غیرفعال <UilTimes /></span>
                    )}</td>
                    <td>{toPersianDigits(item.student.phone_number)}</td>
                    <td>
                      {item.attendance_percentage ? (
                        <strong>{item.attendance_percentage}%</strong>
                      ) : '-'}
                    </td>
                    <td>
                      {item.next_payment ? (
                        <span className={`${styles.badge} ${styles[item.next_payment?.status]}`}>
                          {item.next_payment?.status === "paid" && "پرداخت شده"}
                          {item.next_payment?.status === "pending" && "در انتظار پرداخت"}
                          {item.next_payment?.status === "overdue" && "از موئد گذشته"}
                          {item.next_payment?.status === "unpaid" && "پرداخت نشده"}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <div className={styles.btnContainer}>
                        {item.status === 'active' ? (
                          <button className={styles.deactive} onClick={() => handleDeactiveModal(item)}>
                          غیر فعال کردن
                            <UilTimesCircle />
                          </button>
                        ) : (
                          <button className={styles.active} onClick={() => handleReactiveModal(item)}>
                            فعال کردن
                            <UilCheckCircle />
                          </button>
                        )}
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
      {deactiveModal && (
        <Modal handleModal={() => setDeactiveModal(false)} height='200px'>
          <div className={styles.modal}>
            <h3>غیر فعال کردن ورزشکار در کلاس</h3>
            <p>از غیرفعال کردن ورزشکار "{selectedEnrollment.student.full_name}" مطمئن هستید؟</p>
            <div className={styles.btnContainer}>
              <button className={styles.cancelBtn} onClick={() => setDeactiveModal(false)}>لغو</button>
              <button className={styles.successBtn} onClick={() => handleDeactiveEnrollment()}>بله</button>
            </div>
          </div>
        </Modal> 
      )}

      {reactiveModal && (
        <Modal handleModal={() => setReactiveModal(false)} height='200px'>
          <div className={styles.modal}>
            <h3>فعال کردن ورزشکار در کلاس</h3>
            <p>از فعال کردن ورزشکار "{selectedEnrollment.student.full_name}" مطمئن هستید؟</p>
            <div className={styles.btnContainer}>
              <button className={styles.cancelBtn} onClick={() => setReactiveModal(false)}>لغو</button>
              <button className={styles.successBtn} onClick={() => handleReactiveEnrollment()}>بله</button>
            </div>
          </div>
        </Modal> 
      )}
    </div>
  );
}

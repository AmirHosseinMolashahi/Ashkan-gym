import { useState, useMemo, useEffect } from "react";
import styles from "./StudentsSection.module.scss";
import { UilImport, UilEye, UilEdit, UilTrashAlt, UilTimes, UilTimesCircle, UilCheckCircle, UilCheck } from '@iconscout/react-unicons'
import toPersianDigits from "../../../../hooks/convertNumber";
import useCurrentDateTime from "../../../../hooks/currentDateTime";
import { useNavigate } from 'react-router-dom';
import Modal from "../../../GlobalComponents/Modal/Modal";
import api from "../../../../hooks/api";
import { useToast } from "../../../../context/NotificationContext";
import StudentsCard from "./studentsCard/StudentsCard";
import Pagination from "../../../GlobalComponents/Pagination/Pagination";
import StudentsTableSkeleton from "./studentsTableSkeleton/StudentsTableSkeleton";

const PAGE_SIZE = 5;

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

export default function StudentsSection({ course_id }) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const {date, weekday, month} = useCurrentDateTime()
  const navigate = useNavigate();
  const [deactiveModal, setDeactiveModal] = useState(false)
  const [reactiveModal, setReactiveModal] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const { notify } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false)


  const [students, setStudents] = useState([])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const fetchCourseStudentsList = async (
    url = `/training/courses/detail/${course_id}/students/`
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

      setStudents(res.data.results);
      setPage(res.data.current_page);
      setTotalPages(res.data.total_pages);
      setTotalCount(res.data.count);

      setNextPage(res.data.next);
      setPrevPage(res.data.previous);

    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const buildActivityUrl = (pageNumber = 1) => {
    const params = new URLSearchParams();

    params.append("page", pageNumber);

    if (searchText.trim()) {
      params.append("search", searchText);
    }

    //status
    if (statusFilter !== "all") {
      params.append("status", statusFilter);
    }

    return `/training/courses/detail/${course_id}/students/?${params.toString()}`;
  };


  useEffect(() => {
    fetchCourseStudentsList(buildActivityUrl(page));
  },[page, searchText, statusFilter])
  

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
              value={searchText}
              className={styles.searchInput}
              onChange={e => {
                setSearchText(e.target.value);
                setPage(1);
              }}
            />
            { searchText && (
              <span className={styles.clearSearch} onClick={() => setSearchText("")}><UilTimes /></span>
            )}
          </div>
        </div>
        
        {isMobile ? (
          <StudentsCard
            data={students}
            onDeactivate={handleDeactiveModal}
            onReactivate={handleReactiveModal}
            loading={loading}
          />
        ) : (
          loading === true ? (
            <StudentsTableSkeleton />
          ) : (
            students.length > 0 ? (
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
                    {students.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td className={styles.tableIndex}>{index + 1}</td>
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
                          <td>
                            <div className={styles.phone_number}>
                              {toPersianDigits(item.student.phone_number)}
                            </div>
                          </td>
                          <td>
                            {item.attendance_percentage ? (
                              <strong>{toPersianDigits(item.attendance_percentage)}%</strong>
                            ) : '-'}
                          </td>
                          <td>
                            {item.tuition_status ? (
                              <span className={`${styles.badge} ${styles[item.tuition_status?.status]}`}>
                                {item.tuition_status?.status === "paid" && "پرداخت شده"}
                                {item.tuition_status?.status === "pending" && "در انتظار پرداخت"}
                                {item.tuition_status?.status === "overdue" && "از موئد گذشته"}
                                {item.tuition_status?.status === "unpaid" && "پرداخت نشده"}
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
              ) : (
                <p>هیچ ورزشکاری پیدا نشد!</p>
              )
          )
        )}

        {totalPages > 1 && (
          <div className={styles.paginationWrapper}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onNext={() => {
                if (nextPage) {
                  fetchCourseStudentsList(nextPage);
                }
              }}
              onPrev={() => {
                if (prevPage) {
                  fetchCourseStudentsList(prevPage);
                }
              }}
              onPageChange={(pageNumber) => {
                setPage(pageNumber);
              }}
            />
          </div>
        )}
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

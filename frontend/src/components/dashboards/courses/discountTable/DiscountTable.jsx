import { useState, useMemo, useEffect } from "react";
import styles from "./DiscountTable.module.scss";
import { UilImport, UilEye, UilEdit, UilTrashAlt, UilTimes, UilCheck } from '@iconscout/react-unicons'
import toPersianDigits from "../../../../hooks/convertNumber";
import useCurrentDateTime from "../../../../hooks/currentDateTime";
import Modal from "../../../GlobalComponents/Modal/Modal";
import api from "../../../../hooks/api";
import { useToast } from "../../../../context/NotificationContext";
import DiscountCard from "./discountCard/DiscountCard";
import Pagination from "../../../GlobalComponents/Pagination/Pagination";
import PaymentTableSkeleton from "./paymentTableSkeleton/PaymentTableSkeleton";

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

export default function DiscountTable({ course_id }) {
  const [students, setStudents] = useState([])

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const [loading, setLoading] = useState(false)

  const [searchText, setSearchText] = useState("");
  const [discountFilter, setDiscountFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState('active')

  const {date, weekday, month} = useCurrentDateTime()
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null)

  const { notify } = useToast()
  const isMobile = useIsMobile();

  const [deleteDiscountModal, setDeleteDiscountModal] = useState(false)

  const formatMoney = (value) =>
    `${toPersianDigits(String(Number(value || 0).toLocaleString()))} تومان`;


  const fetchCourseStudentsList = async (
    url = `/training/courses/detail/${course_id}/students/financial/`
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

    //discount
    if (discountFilter !== "all") {
      params.append("has_discount", discountFilter);
    }

    return `/training/courses/detail/${course_id}/students/financial/?${params.toString()}`;
  };


  useEffect(() => {
    fetchCourseStudentsList(buildActivityUrl(page));
  },[page, searchText, statusFilter, discountFilter])

  const [ discountFormData, setDiscountFormData ] = useState({
    custom_due_day: "",
    monthly_fee: "",
    discount_reason: "",
  })

  const handleEditModal = (item) => {
    if (!editModal) {
      setSelectedItem(item);
    } 
    setEditModal(!editModal)
  };

  const handleDeleteDiscountModal = (item) => {
    if (!deleteDiscountModal) {
      setSelectedItem(item)
    }
    setDeleteDiscountModal(!deleteDiscountModal)
  }

  const handleUpdateDiscountFormChange = (e) => {
    const { name, value } = e.target;
    setDiscountFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateDiscount = async () => {
    const data = {}

    if (discountFormData.custom_due_day)
      data.custom_due_day = Number(discountFormData.custom_due_day)

    if (discountFormData.monthly_fee)
      data.monthly_fee = Number(discountFormData.monthly_fee)

    if (discountFormData.discount_reason)
      data.discount_reason = discountFormData.discount_reason


    try {
      const res = await api.put(`/payment/coach/discount/${selectedItem.id}/update/`, data);
      console.log("Update response: ", res.data);
      fetchCourseStudentsList();
      setEditModal(false);
      notify("تغییرات با موفقیت اعمال شد.", "success")
    } catch (err) {
      console.log(err.response?.data)
      notify("تغییرات ذخیره نشد.", "error");
    }
  };

  const handleDeleteDiscount = async () => {
    try {
      await api.delete(`/payment/coach/discount/${selectedItem.id}/delete/`)
      setDeleteDiscountModal(false)
      notify("تخفیف با موفقیت حذف شد", 'info')
    } catch (err) {
      console.log(err)
      notify("خطا در حذف تخفیف.", "error");
    }
  }

  const handleClearFilter = () => {
    setSearchText('')
    setDiscountFilter('all')
    setStatusFilter('active')
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
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

          <div className={styles.left}>
            <label>تخفیف: </label>
            <select
              value={discountFilter}
              onChange={e => {
                console.log(e.target.value)
                setDiscountFilter(e.target.value);
              }}
            >
              <option value="all">همه</option>
              <option value={true}>تخفیف دار</option>
              <option value={false}>بدون تخفیف</option>
            </select>
            
            <label>ورزشکاران: </label>
            <select
              value={statusFilter}
              onChange={e => {
                console.log(e.target.value)
                setStatusFilter(e.target.value);
              }}
            >
              <option value="active">فعال</option>
              <option value="deactive">غیر فعال</option>
              <option value="all">همه</option>
            </select>
          </div>

          <button className={styles.clearFilterBtn} onClick={() => handleClearFilter()}>پاک کردن فیلترها</button>
        </div>

        {/* Table */}
        {isMobile ? (
          <DiscountCard 
            data={students}
            editDiscount={handleEditModal}
            deleteDiscount={handleDeleteDiscountModal}
            loading={loading}
          />
        ) : (
          loading === true ? (
            <PaymentTableSkeleton />
          ) : (
            students.length === 0 ? (
              <p>هیچ دیتایی پیدا نشد!</p>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ردیف</th>
                      <th>ورزشکار</th>
                      <th>تاریخ سررسید</th>
                      <th>تخفیف</th>
                      <th>مبلغ پرداختی</th>
                      <th>علت تخفیف</th>
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
                          <td>
                            {toPersianDigits(item.custom_due_day)} هر ماه
                          </td>
                          <td>
                            {item.paid_amount_info.has_discount === false ? (
                              <UilTimes />
                            ) : (
                              <UilCheck />
                            )}
                          </td>
                          <td>
                            {toPersianDigits(item.paid_amount_info.final_price)} تومان  
                          </td>
                          <td>
                            {item.paid_amount_info.has_discount === false ? (
                              '-'
                            ) : (
                              item.paid_amount_info.reason ? item.paid_amount_info.reason : 'بدون توضیح'
                            )}
                          </td>
                          <td>
                            <div className={styles.btnContainer}>
                              <button className={styles.editBtn} onClick={() => handleEditModal(item)}>
                                ویرایش <UilEdit />
                              </button>
                              {item.paid_amount_info.has_discount ? (
                                <button className={styles.deleteBtn} onClick={() => handleDeleteDiscountModal(item)}>
                                  حذف تخفیف
                                </button>
                              ): ''}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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
      {editModal && (
        <Modal handleModal={() => setEditModal(false)} height='460px' width='500px'>
          <div className={styles.editModal}>
            <h2>تنظیمات شهریه</h2>
            <p>{selectedItem?.student?.full_name}</p>

            <h3>سر رسید</h3>
            <div className={styles.invoiceChangeRow}>
              <label>چندمین روز ماه: </label>
              <input type="number" name="custom_due_day" min='1' max='31' step='1' value={discountFormData.custom_due_day} onChange={handleUpdateDiscountFormChange}/>
              <p className={styles.subtle}>تاریخ قبلی: {selectedItem?.custom_due_day} هر ماه</p>
            </div>

            <h3>مبلغ</h3>
            <div className={styles.invoiceChangeRow}>
              <label>مبلغ جدید: </label>
              <input type="number" name="monthly_fee" value={discountFormData.monthly_fee} onChange={handleUpdateDiscountFormChange} placeholder="مبلغ به تومان" min="0" step="50000"/>
              <p className={styles.subtle}>مبلغ قبلی: {formatMoney(selectedItem?.paid_amount_info.final_price)}</p>
            </div>

            <h3>علت تغییر</h3>
            <div className={styles.invoiceChangeRow}>
              <label>علت تغییر مبلغ</label>
              <input type="text" name="discount_reason" value={discountFormData.discount_reason} onChange={handleUpdateDiscountFormChange} placeholder="علت تغییر را وارد کنید" />
            </div>
            <div className={styles.btnContainer2}>
              <button className={styles.closeBtn} onClick={() => setEditModal(false)}>
                لغو
              </button>
              <button className={styles.saveBtn} onClick={handleUpdateDiscount}>
                ذخیره
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteDiscountModal && (
        <Modal handleModal={() => setDeleteDiscountModal(false)} width='500px' height='200px'>
          <h2 style={{color: '#1c1c1c'}}>حذف تخفیف</h2>
          <p style={{color: '#1c1c1c'}}>آیا از حذف تخفیف برای ورزشکار "{selectedItem.student.full_name}" مطمئن هستید؟</p>
          <div className={styles.btnContainer2}>
            <button className={styles.secondaryBtn} onClick={() => setDeleteDiscountModal(false)}>
              لغو
            </button>
            <button className={styles.closeBtn} onClick={handleDeleteDiscount}>
              حذف
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../../../hooks/api";
import toPersianDigits from "../../../../hooks/convertNumber";
import {
  PERSIAN_MONTH_NAMES,
  getCurrentShamsiPeriod,
} from "../../../../hooks/shamsiDate";
import style from "./PaymentAthletes.module.scss";
import { UilArrowRight, UilEdit } from "@iconscout/react-unicons";
import Modal from "../../../../components/GlobalComponents/Modal/Modal";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian"
import persian_en from "react-date-object/locales/persian_fa"
import { useToast } from '../../../../context/NotificationContext';
import PaymentCard from "./paymentCard.jsx/PaymentCard";
import Pagination from "../../../../components/GlobalComponents/Pagination/Pagination";
import BackButton from "../../../../components/dashboards/backButton/BackButton";
import SummaryGridSkeleton from "./skeletonLoading/summaryGridSkeleton/SummaryGridSkeleton";
import StudentTableSkeleton from "./skeletonLoading/studentTableSkeleton/StudentTableSkeleton";



const ClassTitleSkeleton = () => {
  return (
    <div className={style.classTitle}>
      <div className={`${style.bone} ${style.boneTitle}`} />
      <div className={`${style.bone} ${style.boneSubtitle}`} />
    </div>
  );
};

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

const getTodayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
};

const formatMoney = (value) =>
  `${toPersianDigits(String(Number(value || 0).toLocaleString()))} تومان`;

const formatDateFa = (dateStr) => {
  if (!dateStr) return "بدون سررسید";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("fa-IR");
};

const getRowState = (row) => {
  const today = getTodayISO();
  const remaining = Number(row.remaining_amount || 0);

  if (remaining <= 0 || row.status === "paid") {
    return { key: "paid", label: "پرداخت شده" };
  }

  if (row.due_date && row.due_date < today) {
    return { key: "overdue", label: "معوق" };
  }

  return { key: "pending", label: "در انتظار" };
};

const PaymentAthletes = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const { notify } = useToast();

  const current = getCurrentShamsiPeriod();
  const year = Number(searchParams.get("year")) || current.year;
  const month = Number(searchParams.get("month")) || current.month;

  const [studentList, setStudentList] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const [methodByInvoice, setMethodByInvoice] = useState({});
  const [searchText, setSearchText] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all"); // all | paid | unpaid
  const [changeInvoiceModal, setChangeInvoiceModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const isMobile = useIsMobile();

  const [ invoiceFormData, setInvoiceFormData ] = useState({
    manual_amount: "",
    manual_due_date: "",
    manual_reason: "",
  })


  const handleChangeInvoiceModal = (invoiceId) => {
    if (!changeInvoiceModal) {
      console.log("invoiceId: ", invoiceId)
      setSelectedInvoice(invoiceId)
      setChangeInvoiceModal(!changeInvoiceModal)
    }
    setChangeInvoiceModal(!changeInvoiceModal)
  }

  const handleUpdateInvoiceFormChange = (e) => {
    const { name, value } = e.target;
    setInvoiceFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateInvoice = async () => {
    const data = {
      manual_amount: invoiceFormData.manual_amount || null,
      manual_due_date: invoiceFormData.manual_due_date || null,
      manual_reason: invoiceFormData.manual_reason || '',
    };


    try {
      const res = await api.put(`/payment/coach/invoices/${selectedInvoice.inv_id}/manual-update/`, data);
      console.log("Update response: ", res.data);
      fetchCourseInvoices();
      setChangeInvoiceModal(false);
      notify("به روزرسانی با موفقیت انجام شد.", "success")
    } catch (err) {
      console.error(err);
      notify("به‌روزرسانی فاکتور انجام نشد.", "error");
    }
  };

  const fetchCourseInvoices = async (
    url = `/payment/coach/invoices/?course_id=${courseId}&year=${year}&month=${month}`
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

      setStudentList(res.data.results.students);
      setSummary(res.data.results.summary);

      setPage(res.data.current_page);
      setTotalPages(res.data.total_pages);
      setTotalCount(res.data.count);

      setNextPage(res.data.next);
      setPrevPage(res.data.previous);
      
      const fetchedRows = res.data.results.students || [];

      setMethodByInvoice(
        Object.fromEntries(fetchedRows.map((r) => [r.inv_id, "cash"]))
      );

    } catch (err) {
        setError("خطا در بارگذاری اطلاعات پرداخت ورزشکارها");
    } finally {
      setLoading(false);
    }
  };

  const buildActivityUrl = (pageNumber = 1) => {
    const params = new URLSearchParams();

    params.append("course_id", courseId);
    params.append("year", year);
    params.append("month", month);

    params.append("page", pageNumber);

    if (searchText.trim()) {
      params.append("search", searchText);
    }

    // status
    if (paymentFilter !== "all") {
      params.append("status", paymentFilter);
    }

    return `/payment/coach/invoices/?${params.toString()}`;
  };

  useEffect(() => {
    fetchCourseInvoices(buildActivityUrl(page));
  }, [courseId, year, month, page, searchText, paymentFilter]);

  const monthLabel = `${PERSIAN_MONTH_NAMES[month - 1]} ${year}`;


  const handleMarkPaid = async (invoiceId) => {
    try {
      setUpdatingId(invoiceId);
      const method = methodByInvoice[invoiceId] || "cash";
      console.log(method)
      const res = await api.post(`/payment/coach/invoices/${invoiceId}/`, {
        status: "paid",
        payment_method: method,
      });
      fetchCourseInvoices();
      notify("پرداخت با موفقیت انجام شد.", "success")
    } catch (e) {
      notify("ثبت پرداخت انجام نشد.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemind = (row) => {
    alert(`یادآوری برای ${row.student_name} ارسال شد (دمو).`);
  };

  const handleRemindAll = () => {
    const list = rows.filter((r) => getRowState(r).key !== "paid");
    alert(`یادآوری برای ${list.length} ورزشکار ارسال شد (دمو).`);
  };

  if (error) return <div className={style.page}>{error}</div>;

  return (
    <div className={style.page}>
      <div className={style.topRow}>
        <div className={style.wrapper}>
          <BackButton route="/dashboard/payment" title="بازگشت" />
          <div className={style.container}>
            {loading === true ? (
              <ClassTitleSkeleton />
            ) : (
              <div className={style.classTitle}>
                <h2 className={style.title}>{summary?.course_title}</h2>
                <p className={style.subtitle}>
                  {toPersianDigits(String(summary?.students_count))} ورزشکار
                </p>
              </div>
            )}
             <div className={style.monthTag}>
                {toPersianDigits(monthLabel)}
              </div>
          </div>
        </div>
      </div>

      {loading === true ? (
        <SummaryGridSkeleton />
      ) : (
        <div className={style.summaryGrid}>
          <article className={style.card}>
            <p className={style.cardLabel}>مجموع مورد انتظار</p>
            <h3>{formatMoney(summary?.total_expected)}</h3>
            <span className={style.subtle}>
              {toPersianDigits(String(summary?.students_count))} ورزشکار
            </span>
          </article>

          <article className={style.card}>
            <p className={style.cardLabel}>دریافت شده</p>
            <h3>{formatMoney(summary?.collected)}</h3>
            <span className={`${style.badge} ${style.paid}`}>
              {toPersianDigits(
                String(studentList.filter((r) => getRowState(r).key === "paid").length)
              )}{" "}
              پرداخت شده
            </span>
          </article>

          <article className={style.card}>
            <p className={style.cardLabel}>در انتظار</p>
            <h3>{formatMoney(summary?.pending)}</h3>
            <span className={`${style.badge} ${style.pending}`}>
              {toPersianDigits(String(summary?.pending_count))} پرداخت نشده
            </span>
          </article>

          <article className={`${style.card} ${style.actionCard}`}>
            <p className={style.cardLabel}>نیازمند اقدام</p>
            <h3>{toPersianDigits(String(summary?.pending_count))} ورزشکار در انتظار</h3>
            <button className={style.primaryBtn} onClick={handleRemindAll}>
              یادآوری به همه
            </button>
          </article>
        </div>
      )}

      <div className={style.filtersBar}>
        <input
          className={style.searchInput}
          type="text"
          placeholder="جستجوی ورزشکار (نام یا کد ملی)..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <select
          className={style.filterSelect}
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="paid">فقط پرداخت‌شده</option>
          <option value="unpaid">فقط پرداخت‌نشده</option>
        </select>
      </div>
      

      {isMobile ? (
        <PaymentCard
          data={studentList}
          rowState={getRowState}
          methodByInvoice={methodByInvoice}
          setMethodByInvoice={setMethodByInvoice}
          handleChangeInvoiceModal={handleChangeInvoiceModal}
          handleRemind={handleRemind}
          handleMarkPaid={handleMarkPaid}
          updatingId={updatingId}
          loading={loading}
        />
      ) : (
        loading === true ? (
          <StudentTableSkeleton />
        ) : (
          <div className={style.tableWrap}>
            <div className={style.tableHead}>
              <span>ورزشکار</span>
              <span>وضعیت پرداخت</span>
              <span>مبلغ</span>
              <span>تغییرات</span>
              <span>عملیات</span>
            </div>

            {studentList.map((row) => {
              const state = getRowState(row);

              return (
                <div className={style.tableRow} key={row.id}>
                  <div className={style.athleteCell}>
                    <div className={style.avatar}>
                      {row.profile_picture ? (
                        <img src={row.profile_picture} alt={row.student_name} />
                      ) : (
                        <span>{row.student_name?.slice(0, 1) || "و"}</span>
                      )}
                    </div>
                    <div>
                      <p className={style.name}>{row.student_name}</p>
                      <p className={style.emailLike}>{row.student_national_id || "—"}</p>
                    </div>
                  </div>

                  <div className={style.paymentStatus}>
                    <div className={`${style.badge} ${style[state.key]}`}>{state.label}</div>
                    {state.key !== 'paid' ? (
                      <>
                      <div className={style.notifiedStatus}>
                        {row.overdue_notified_count ? (
                        `${toPersianDigits(row.overdue_notified_count)} یادآور ارسال شده است`
                      ) : ''}
                      </div>
                      <div className={style.notifiedDate}>
                        {row.overdue_notified_at ? (
                        `در تاریخ: ${toPersianDigits(row.overdue_notified_at)}`
                      ) : ''}
                      </div>
                      </>
                    ): ''}
                  </div>

                  <div>
                    <p className={style.amount}>{formatMoney(row.final_amount)}</p>
                    <p className={style.dateText}>
                      {state.key === "paid"
                        ? formatDateFa(row.payments[0].paid_at?.slice(0, 10))
                        : `سررسید: ${formatDateFa(row.due_date)}`}
                    </p>
                    <p className={style.dateText}>
                      روش پرداخت: {row.payments[0]?.method_label || "—"}
                    </p>
                  </div>

                  <div className={style.changeInvoice}>
                    {state.key !== "paid" ? (
                      <button onClick={() => handleChangeInvoiceModal(row)}>
                        <UilEdit /> تغییر فاکتور
                      </button>
                    ) : (
                      <span className={style.subtle}>امکات تغییر فاکتور نمیباشد</span>
                    )}
                  </div>

                  <div className={style.actions}>
                    {state.key === "paid" ? (
                      <button className={style.ghostBtn}>رسید</button>
                    ) : (
                      <>
                        <select
                          className={style.methodSelect}
                          value={methodByInvoice[row.inv_id] || "cash"}
                          onChange={(e) =>
                            setMethodByInvoice((prev) => ({
                              ...prev,
                              [row.inv_id]: e.target.value,
                            }))
                          }
                        >
                          <option value="cash">نقدی</option>
                          <option value="pos">کارت‌خوان</option>
                          <option value="transfer">کارت‌به‌کارت/واریز</option>
                          <option value="online">آنلاین</option>
                        </select>
                        <button className={style.ghostBtn} onClick={() => handleRemind(row)}>
                          یادآوری
                        </button>
                        <button
                          className={style.primaryBtn}
                          onClick={() => handleMarkPaid(row.inv_id)}
                          disabled={updatingId === row.inv_id}
                        >
                          {updatingId === row.inv_id ? "..." : "ثبت پرداخت"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {studentList.length === 0 && <p className={style.empty}>موردی با این فیلتر/جستجو پیدا نشد.</p>}
          </div>
        )
      )}
      {totalPages > 1 && (
        <div className={style.paginationWrapper}>
          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            onNext={() => {
              if (nextPage) {
                fetchCourseInvoices(nextPage);
              }
            }}
            onPrev={() => {
              if (prevPage) {
                fetchCourseInvoices(prevPage);
              }
            }}
            onPageChange={(pageNumber) => {
              setPage(pageNumber);
            }}
          />
        </div>
      )}
      {changeInvoiceModal && (
        <Modal handleModal={() => setChangeInvoiceModal(false)} height="500px" width="500px">
          <h2>تغییر فاکتور</h2>
          <p><strong>{selectedInvoice?.student_name}</strong> در کلاس {selectedInvoice?.course_title}</p>
          <h3>مبلغ</h3>
          <div className={style.invoiceChangeRow}>
            <label>مبلغ جدید: </label>
            <input type="number" name="manual_amount" value={invoiceFormData.manual_amount} onChange={handleUpdateInvoiceFormChange} placeholder="مبلغ به تومان" min="0" step="50000"/>
            <p className={style.subtle}>مبلغ قبلی: {formatMoney(selectedInvoice?.final_amount)}</p>
          </div>

          <h3>سر رسید</h3>
          <div className={style.invoiceChangeRow}>
            <label>تاریخ جدید: </label>
            <DatePicker
              value={selectedInvoice?.manual_due_date_jalali}  // اگر تاریخ دستی وجود داشت، اون رو نشون بده
              calendar={persian}
              locale={persian_en}
              onChange={(date) => {
                const miladi = date?.format("YYYY/MM/DD");  // ← این رشته میلادی
                setInvoiceFormData({ ...invoiceFormData, manual_due_date: miladi });
              }}
              render={(value, openCalendar) => (
              <input
                onFocus={openCalendar}
                value={value}           // این فارسی نمایش می‌دهد
                placeholder="تاریخ سررسید"
                className={style.formInput}
                readOnly
              />
            )}
            />
            <p className={style.subtle}>تاریخ قبلی: {formatDateFa(selectedInvoice?.due_date)}</p>
          </div>

          <h3>علت تغییر</h3>
          <div className={style.invoiceChangeRow}>
            <label>علت تغییر فاکتور</label>
            <input type="text" name="manual_reason" value={invoiceFormData.manual_reason} onChange={handleUpdateInvoiceFormChange} placeholder="علت تغییر فاکتور" />
          </div>
          <div className={style.btnContainer}>
            <button className={style.closeBtn} onClick={() => setChangeInvoiceModal(false)}>
              لغو
            </button>
            <button className={style.saveBtn} onClick={() => handleUpdateInvoice()}>
              ذخیره
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentAthletes;

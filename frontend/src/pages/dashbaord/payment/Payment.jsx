import React, { useMemo, useEffect, useState } from "react";
import { UilCalendarAlt, UilArrowLeft } from "@iconscout/react-unicons";
import style from "./Payment.module.scss";
import api from "../../../hooks/api";
import { getCurrentShamsiPeriod, PERSIAN_MONTH_NAMES } from "../../../hooks/shamsiDate";
import toPersianDigits from "../../../hooks/convertNumber";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/GlobalComponents/Pagination/Pagination";
import BackButton from "../../../components/dashboards/backButton/BackButton";
import SummaryGridSkeleton from "./skeletonLoading/summaryGridSkeleton/SummaryGridSkeleton";
import ClassListSkeleton from "./skeletonLoading/classListSkeleton/ClassListSkeleton";


const Payment = () => {
  const { year: defaultYear, month: defaultMonth,} = getCurrentShamsiPeriod();

  const [courses, setCourses] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState('both')
  

  const navigate = useNavigate();

  const monthLabel = useMemo(
    () => `${PERSIAN_MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`,
    [selectedMonth, selectedYear]
  );

  const fetchInvoices = async (
    url = `/payment/coach/invoices/dashboard/?year=${selectedYear}&month=${selectedMonth}`
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
      
      setCourses(res.data.results.courses || []);
      setSummary(res.data.results.summary);

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

      params.append("year", selectedYear);
      params.append("month", selectedMonth);

      params.append("page", pageNumber);

      if (searchText.trim()) {
        params.append("search", searchText);
      }

      // gender
      if (genderFilter !== "both") {
        params.append("gender", genderFilter);
      }

      // days
      if (dayFilter !== "all") {
        params.append("day_group", dayFilter);
      }

      return `/payment/coach/invoices/dashboard/?${params.toString()}`;
    };

  const handleClearFilter = () => {
    setSearchText('')
    setGenderFilter('both')
    setDayFilter('all')
    setPage(1)
  } 

  useEffect(() => {
      fetchInvoices(buildActivityUrl(page));
    }, [selectedYear, selectedMonth, page, searchText, genderFilter, dayFilter]);

  const yearOptions = useMemo(() => {
    const y = getCurrentShamsiPeriod().year;
    return [y, y - 1].map((yr) => ({ value: yr, label: toPersianDigits(String(yr)) }));
  }, []);

  return (
    <div className={style.paymentPage}>
      <BackButton route="/dashboard" title="بازگشت" />
      <div className={style.header}>
        <div className={style.titleWrap}>
          <h2>نمای کلی پرداخت مربی</h2>
          <p>
            پرداخت‌های هر کلاس را ببین و وضعیت پرداخت ورزشکارها را در ماه انتخاب‌شده بررسی کن.
          </p>
        </div>
        <div className={style.monthSelectWrap}>
          <select
            className={style.monthBadge}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            aria-label="انتخاب ماه"
          >
            {PERSIAN_MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            className={style.monthBadge}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            aria-label="انتخاب سال"
          >
            {yearOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className={style.monthBadge}>
            <UilCalendarAlt size="16" />
            ماه انتخاب‌شده: {toPersianDigits(monthLabel)}
          </span>
        </div>
      </div>

      {loading === true ? (
        <SummaryGridSkeleton />
      ) : (
        <div className={style.summaryGrid}>
          <article className={style.summaryCard}>
            <p className={style.cardTitle}>مجموع مورد انتظار</p>
            <h3>{toPersianDigits(summary.total_expected)} تومان</h3>
            <p className={style.subtle}>همه کلاس‌ها – {toPersianDigits(monthLabel)}</p>
          </article>

          <article className={style.summaryCard}>
            <p className={style.cardTitle}>دریافتی</p>
            <h3>{toPersianDigits(summary.collected)} تومان</h3>
            <div className={`${style.miniBadge} ${style.good}`}>
              {toPersianDigits(String(summary.collected_percent))}٪ دریافت شده
            </div>
          </article>

          <article className={style.summaryCard}>
            <p className={style.cardTitle}>در انتظار</p>
            <h3>{toPersianDigits(summary.pending)} تومان</h3>
            <div className={`${style.miniBadge} ${style.warning}`}>
              {toPersianDigits(String(summary.pending_athletes))} ورزشکار در انتظار پرداخت
            </div>
          </article>

          <article className={style.summaryCard}>
            <p className={style.cardTitle}>معوق</p>
            <h3>{toPersianDigits(summary.overdue)} تومان</h3>
            <div className={`${style.miniBadge} ${style.danger}`}>نیازمند پیگیری</div>
          </article>
        </div>
      )}

      <div className={style.filtersBar}>
        <input
          className={style.searchInput}
          type="text"
          placeholder="جستجوی کلاس (برای مثال: ووشو یا ...)"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className={style.filterWrap}>
          <div className={style.filterObj}>
            <label htmlFor="">روزها:</label>
            <select
              className={style.filterSelect}
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
            >
              <option value="all">همه روزها</option>
              <option value="even">روزهای زوج</option>
              <option value="odd">روزهای فرد</option>
            </select>
          </div>

          <div className={style.filterObj}>
            <label htmlFor="">جنسیت:</label>
            <select
              className={style.filterSelect}
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="both">فرقی ندارد</option>
              <option value="male">آقایان</option>
              <option value="female">بانوان</option>
            </select>
          </div>
        </div>
        
        <div className={style.filterObj}>
          <button className={style.clearFilterBtn} onClick={() => handleClearFilter()}>پاک کردن فیلتر ها</button>
        </div>

      </div>

      <section className={style.classesSection}>
        <h3>کلاس‌های من</h3>
        <p className={style.sectionDescription}>
          یک کلاس را انتخاب کن تا صفحه جداگانه لیست ورزشکارها و وضعیت پرداخت ماه انتخاب‌شده
          نمایش داده شود.
        </p>

        {loading === true ? (
          <ClassListSkeleton />
        ) : (
          courses.length === 0 ? (
            <p className={style.footerNote}>کلاسی برای نمایش وجود ندارد.</p>
          ) : (
            <div className={style.classList}>
              {courses?.map((item) => (
                <article key={item.id} className={style.classRow}>
                  <div className={style.classInfo}>
                    <div className={style.classTitle}>
                      <h4>{item.title} </h4>
                      <div className={style.classStatus}>
                        <span className={`${style.badge} ${item.active ? style.good : style.danger}`}>{item.active ? 'فعال' : 'غیر فعال'}</span>
                        <span className={`${style.stateBadge} ${style[item.state.type]}`}>
                          {item.state.label}
                        </span>
                      </div>

                    </div>
                    <div className={style.classCoach}>
                      <h5>مربی: {item.coach.full_name}</h5>
                    </div>
                    <p className={style.timeTable}>
                      📅 {toPersianDigits(item.timeTable)}
                    </p>
                    <p>
                      👥
                      {item.gender === 'female' ? (
                        ' بانوان'
                      ) : (
                        ' آقایان'
                      )} - تعداد  ورزشکاران : {toPersianDigits(String(item?.athletes))}
                    </p>
                    <div className={style.rowMeta}>
                      <span>
                        💵
                        {toPersianDigits(String(item?.paid_count ?? 0))} / {toPersianDigits(String(item?.inv_count ?? 0))} پرداخت شده
                          - 
                        {toPersianDigits(item?.pending_amount)} تومان در انتظار
                      </span>
                    </div>
                  </div>

                  <div className={style.actions}>
                    {item.active && (
                      <button
                        className={style.actionBtn}
                        type="button"
                        onClick={() => 
                          navigate(
                            `/dashboard/payment/courses/${item.id}?year=${selectedYear}&month=${selectedMonth}`
                          )
                        }
                        >
                          صفحه پرداخت ورزشکارها<UilArrowLeft />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )
        )}
        {courses.length > 0 && (
          <p className={style.footerNote}>
            روی هر کلاس بزن تا وارد صفحه جزئیات پرداخت ورزشکارها برای ماه انتخاب‌شده شوی.
          </p>
        )}
        {totalPages > 1 && (
          <div className={style.paginationWrapper}>
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onNext={() => {
                if (nextPage) {
                  fetchInvoices(nextPage);
                }
              }}
              onPrev={() => {
                if (prevPage) {
                  fetchInvoices(prevPage);
                }
              }}
              onPageChange={(pageNumber) => {
                setPage(pageNumber);
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default Payment;

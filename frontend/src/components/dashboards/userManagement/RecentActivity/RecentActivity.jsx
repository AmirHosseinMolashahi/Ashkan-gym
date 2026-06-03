import React, { useEffect, useState, useRef } from 'react'
import { UilImport, UilEdit, UilTrashAlt, UilTimes } from '@iconscout/react-unicons'
import styles from './RecentActivity.module.scss'
import api from '../../../../hooks/api';
import toPersianDigits from '../../../../hooks/convertNumber';
import roleConverter, { hasRole } from '../../../../hooks/roleConverter';
import { useSelector } from 'react-redux';
import ActivityCard from './activityCard/ActivityCard';
import Pagination from '../../../GlobalComponents/Pagination/Pagination';

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

const RecentActivity = () => {
  const [ activity, setActivity ] = useState([])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const { user } = useSelector(
    state => state.auth
  )

  const listRef = useRef(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all")

  const isMobile = useIsMobile();

  const fetchActivity = async (
    url = "/activity/manager/recent/"
  ) => {
    try {
      let finalUrl = url;

      if (url.startsWith("http")) {
        const parsed = new URL(url);
        finalUrl = `${parsed.pathname}${parsed.search}`;
      }

      const res = await api.get(finalUrl);
      
      setActivity(res.data.results);

      setPage(res.data.current_page);
      setTotalPages(res.data.total_pages);
      setTotalCount(res.data.count);

      setNextPage(res.data.next);
      setPrevPage(res.data.previous);

      console.log(res.data)

      if (isMobile) {
        listRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } catch (err) {
      console.log(err)
    }
  }

  const buildActivityUrl = (pageNumber = 1) => {
    const params = new URLSearchParams();

    params.append("page", pageNumber);

    // search
    if (search.trim()) {
      params.append("search", search);
    }

    // role filter
    if (roleFilter !== "all") {
      params.append(
        "actor__roles__name",
        roleFilter
      );
    }

    return `/activity/manager/recent/?${params.toString()}`;
  };

  useEffect(() => {
    fetchActivity(buildActivityUrl(page));
  }, [page, search, roleFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.toolbar} ref={listRef}>
          <div className={styles.clearSearch}>
            <button>
              پاک کردن فیلترها <UilTimes />
            </button>
          </div>
          <div className={styles.left}>

            {hasRole(user.roles, 'manager') ? (
              <div className={styles.filterObj}>
              <p>نقش: </p>
              <select
                value={roleFilter}
                onChange={e => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">همه</option>
                <option value="coach">مربی</option>
                <option value="athlete">ورزشکار</option>
                <option value="manager">مدیر</option>
              </select>
              </div>
            ) : ''}
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
            {search && (
              <span className={styles.clearSearch}
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              >
                <UilTimes />
              </span>
            )}
          </div>
        </div>

        {isMobile ? (
          <ActivityCard 
            data={activity}
          />
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>ورزشکار</th>
                  <th>نقش</th>
                  <th>وضعیت</th>
                  <th>آخرین فعالیت</th>
                  <th>زمان</th>
                  <th>حذف</th>
                </tr>
              </thead>

              <tbody>
                {activity.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{toPersianDigits((page - 1) * 10 + index + 1)}</td>
                    <td>
                      <div className={styles.students}>
                        <img src={item.actor.profile_picture} alt={item.actor.full_name} />
                        <div>
                          <strong>{item.actor.full_name}</strong>
                          <p>{toPersianDigits(item.actor.national_id)}</p>
                        </div>
                      </div>
                    </td>
                    <td><strong>{roleConverter(item.actor.roles)}</strong></td>
                    <td>{item.actor.is_active ? 'فعال' : 'غیرفعال'}</td>
                    <td>
                      <span className={styles.badge}>
                        {item.description}
                      </span>
                    </td>
                    <td>{toPersianDigits((item.created_at_jalali || "").split(" ")[0] || "-")}</td>
                    <td>
                      <div className={styles.btnContainer}>
                        <button><UilTrashAlt fill='#C1121F' /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.paginationWrapper}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onNext={() => {
              if (nextPage) {
                fetchActivity(nextPage);
              }
            }}
            onPrev={() => {
              if (prevPage) {
                fetchActivity(prevPage);
              }
            }}
            onPageChange={(pageNumber) => {
              setPage(pageNumber);
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default RecentActivity
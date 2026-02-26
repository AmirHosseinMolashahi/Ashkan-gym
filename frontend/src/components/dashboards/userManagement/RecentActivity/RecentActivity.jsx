import React, { useEffect, useState } from 'react'
import { UilImport, UilEdit, UilTrashAlt, UilTimes } from '@iconscout/react-unicons'
import styles from '../AllUsersTable/AllUsersSection.module.scss'
import api from '../../../../hooks/api';
import toPersianDigits from '../../../../hooks/convertNumber';
import roleConverter from '../../../../hooks/roleConverter';

const RecentActivity = () => {
  const [ activity, setActivity ] = useState([])
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all")
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const fetchActivity = async () => {
    try {
      const res = await api.get('/activity/manager/recent/')
      setActivity(res.data.results)
      console.log(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchActivity();
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.toolbar}>
          <div className={styles.left}>
            <button>استخراج <UilImport /></button>

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
                  <td>{toPersianDigits((page - 1) * pageSize + index + 1)}</td>
                  <td>
                    <div className={styles.students}>
                      <img src={item.actor.profile_picture} alt={item.actor.full_name} />
                      <div>
                        <strong>{item.actor.full_name}</strong>
                        <p>{toPersianDigits(item.actor.national_id)}</p>
                      </div>
                    </div>
                  </td>
                  <td><strong>{roleConverter(item.actor.role)}</strong></td>
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

        <div className={styles.pagination}>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            بعدی
          </button>
          <span>{toPersianDigits(page)} / {toPersianDigits(totalPages)}</span>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            قبلی
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecentActivity
import React, {useEffect, useState} from 'react'
import style from './UserManagement.module.scss';
import toPersianDigits from '../../../hooks/convertNumber';
import { UilUsersAlt, UilCheckCircle} from '@iconscout/react-unicons'
import AllUsersSection from '../../../components/dashboards/userManagement/AllUsersTable/AllUsersSection'
import api from '../../../hooks/api';
import RecentActivity from '../../../components/dashboards/userManagement/RecentActivity/RecentActivity';
import { useToast } from '../../../context/NotificationContext';

const UserManagement = () => {
  const [ activeTab, setActiveTab] = useState(1)
  const [ allUsers, setAllUsers ] = useState([])
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isActiveFilter, setIsActiveFilter] = useState("all");

  const [ deleteModal, setDeleteModal ] = useState(false);
  const [ selectedUser, setSelectedUser ] = useState(null);

  const { notify } = useToast();

  const handleDeleteModal = (id = null) => {
    if (id !== null) {
      setSelectedUser(id);
    }
    setDeleteModal(!deleteModal)
  }

  const [summary, setSummary] = useState({
    total_users: 0,
    active_today: 0,
    new_this_month: 0,
    new_prev_month: 0,
    inactive_users: 0,
  });

  const fetchSummary = async () => {
    try {
      const res = await api.get("/account/management-summary/");
      setSummary(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/account/management-users/${id}/delete/`);
      notify('کاربر با موفقیت حذف شد!', 'info')
      handleDeleteModal();
      fetchAllUsers()
    } catch (err) {
      notify('خطا در حذف کاربر!', 'error')
    }
  }

  const fetchAllUsers = async () => {
    try {
      const params = { page, page_size: pageSize };

      if (roleFilter !== "all") params.role = roleFilter;
      if (isActiveFilter !== "all") {
        params.is_active = isActiveFilter === "active" ? "true" : "false";
      }
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/account/all-users/', { params });
      setAllUsers(res.data.results || []);
      setTotalCount(res.data.count || 0);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchAllUsers()
  }, [page, pageSize, search, roleFilter, isActiveFilter])

  return (
    <div className={style.userManagement}>
      <div className={style.header}>

      </div>
      <div className={style.summaryGrid}>
        <article className={style.summaryCard}>
          <p className={style.cardTitle}>تعداد کل کاربران</p>
          <h3>{toPersianDigits(summary.total_users)} نفر</h3>
          {/* <p className={style.subtle}>12% بیشتر از ماه قبل</p> */}
        </article>

        <article className={style.summaryCard}>
          <p className={style.cardTitle}>امروز فعال بودن</p>
          <h3>{toPersianDigits(summary.active_today)} نفر</h3>
          {/* <div className={`${style.miniBadge} ${style.good}`}>
            {toPersianDigits(3)}نفر بیشتر از ماه قبل
          </div> */}
        </article>

        <article className={style.summaryCard}>
          <p className={style.cardTitle}>ثبت نام جدید (این ماه)</p>
          <h3>{toPersianDigits(summary.new_this_month)} نفر</h3>
          {/* <div className={`${style.miniBadge} ${style.warning}`}>
            {toPersianDigits(Math.max(summary.new_this_month - summary.new_prev_month, 0))} نفر بیشتر از ماه قبل
          </div> */}
        </article>

        <article className={style.summaryCard}>
          <p className={style.cardTitle}>غیر فعال</p>
          <h3>{toPersianDigits(summary.inactive_users)} نفر</h3>
          {/* <div className={`${style.miniBadge} ${style.danger}`}>نیازمند پیگیری</div> */}
        </article>
      </div>
      <div className={style.tabWrapper}>
        <div className={style.tabs}>
          <ul>
            <li className={activeTab === 1 ? style.active : ''} onClick={() => setActiveTab(1)}>
              <UilUsersAlt />
              ورزشکاران
            </li>
            <li className={activeTab === 2 ? style.active : ''} onClick={() => setActiveTab(2)}>
              <UilCheckCircle />
              فعالیت های اخیر
            </li>
          </ul>
        </div>
        { activeTab === 1 && (
          <AllUsersSection
            users={allUsers}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            totalCount={totalCount}
            search={search}
            setSearch={setSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            isActiveFilter={isActiveFilter}
            setIsActiveFilter={setIsActiveFilter}
            deleteModal={deleteModal}
            handleDeleteModal={handleDeleteModal}
            selectedUser={selectedUser}
            handleDeleteUser={handleDeleteUser}
          />
        )}
        { activeTab === 2 && (
          <RecentActivity />
        )}
      </div>
    </div>
  )
}

export default UserManagement
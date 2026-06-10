import React, {useEffect, useState} from 'react'
import style from './UserManagement.module.scss';
import toPersianDigits from '../../../hooks/convertNumber';
import { UilUsersAlt, UilHeartRate} from '@iconscout/react-unicons'
import AllUsersSection from '../../../components/dashboards/userManagement/AllUsersTable/AllUsersSection'
import api from '../../../hooks/api';
import RecentActivity from '../../../components/dashboards/userManagement/RecentActivity/RecentActivity';
import { useToast } from '../../../context/NotificationContext';
import { useSelector } from 'react-redux';
import BackButton from '../../../components/dashboards/backButton/BackButton';
import UserSummaryGridSkeleton from './userSummaryGridSkeleton/UserSummaryGridSkeleton';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState(1)
  const [allUsers, setAllUsers] = useState([])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const [loading, setLoading] = useState(false)

  const { user } = useSelector(
      state => state.auth
    )

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isActiveFilter, setIsActiveFilter] = useState("all");
  const [insuranceFilter, setInsuranceFilter] = useState("all");

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

  const fetchAllUsers = async (
    url = "/account/users/management/"
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
      setSummary(res.data.results.summary)
      setAllUsers(res.data.results.users)

      if (res.data.current_page !== page) {
        setPage(res.data.current_page);
      }
      setTotalCount(res.data.results.total_count);
      setTotalPages(res.data.results.total_pages);

      setNextPage(res.data.results.next);
      setPrevPage(res.data.results.previous);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false)
    }
  };

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
        "roles__name",
        roleFilter
      );
    }

    if (isActiveFilter !== "all") {
      params.append(
        "is_active",
        isActiveFilter === "active" ? "true" : "false"
      );
    }

    if (insuranceFilter !== "all") {
      params.append(
        "insurance",
        insuranceFilter === "true" ? "true" : "false"
      );
    }

    return `/account/users/management/?${params.toString()}`;
  };

  useEffect(() => {
    fetchAllUsers(buildActivityUrl(page));
  }, [page, search, roleFilter, isActiveFilter, insuranceFilter]);
  
  
  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setIsActiveFilter("all");
    setInsuranceFilter("all");
    
    setPage(1);
  };

  return (
    <div className={style.userManagement}>
      <BackButton route="/dashboard" title="بازگشت" />
      <div className={style.header}>
        <h3>مدیریت کاربران</h3>
      </div>

      {loading === true ? (
        <UserSummaryGridSkeleton />
      ) : (
        <div className={style.summaryGrid}>
          <article className={style.summaryCard}>
            <p className={style.cardTitle}>تعداد کل کاربران</p>
            <h3>{toPersianDigits(summary.total_users)} نفر</h3>
          </article>

          <article className={style.summaryCard}>
            <p className={style.cardTitle}>امروز فعال بودن</p>
            <h3>{toPersianDigits(summary.active_today)} نفر</h3>
          </article>

          <article className={style.summaryCard}>
            <p className={style.cardTitle}>ثبت نام جدید (این ماه)</p>
            <h3>{toPersianDigits(summary.new_this_month)} نفر</h3>
          </article>

          <article className={style.summaryCard}>
            <p className={style.cardTitle}>غیر فعال</p>
            <h3>{toPersianDigits(summary.inactive_users)} نفر</h3>
          </article>
        </div>
      )}

      <div className={style.tabWrapper}>
        <div className={style.tabs}>
          <ul>
            <li className={activeTab === 1 ? style.active : ''} onClick={() => setActiveTab(1)}>
              <UilUsersAlt />
              ورزشکاران
            </li>
            <li className={activeTab === 2 ? style.active : ''} onClick={() => setActiveTab(2)}>
              <UilHeartRate />
              فعالیت های اخیر
            </li>
          </ul>
        </div>
        { activeTab === 1 && (
          <AllUsersSection
            user={user}
            users={allUsers}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            totalCount={totalCount}
            nextPage={nextPage}
            prevPage={prevPage}
            fetchAllUsers={fetchAllUsers}
            search={search}
            setSearch={setSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            isActiveFilter={isActiveFilter}
            setIsActiveFilter={setIsActiveFilter}
            insuranceFilter={insuranceFilter}
            setInsuranceFilter={setInsuranceFilter}
            deleteModal={deleteModal}
            handleDeleteModal={handleDeleteModal}
            selectedUser={selectedUser}
            handleDeleteUser={handleDeleteUser}
            clearFilters={clearFilters}
            loading={loading}
          />
        )}
        { activeTab === 2 && (
          <RecentActivity />
        )}
      </div>
    </div>
  )
}

export default UserManagement;
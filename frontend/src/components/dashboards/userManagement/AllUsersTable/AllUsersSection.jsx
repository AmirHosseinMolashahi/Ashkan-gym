import React, {useState, useEffect, useMemo} from "react";
import styles from "./AllUsersSection.module.scss";
import { UilImport, UilEdit, UilTrashAlt, UilTimes } from '@iconscout/react-unicons'
import toPersianDigits from "../../../../hooks/convertNumber";
import roleConverter, { hasRole } from "../../../../hooks/roleConverter";
import { useNavigate } from 'react-router-dom';
import Modal from "../../../GlobalComponents/Modal/Modal";
import AllUsersCard from "./allUsersCard/AllUsersCard";
import Pagination from "../../../GlobalComponents/Pagination/Pagination";

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

export default function AllUsersSection({
  user,
  users,
  page,
  setPage,
  totalPages,
  totalCount,
  nextPage,
  prevPage,
  fetchAllUsers,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  isActiveFilter,
  setIsActiveFilter,
  insuranceFilter,
  setInsuranceFilter,
  deleteModal,
  handleDeleteModal,
  selectedUser,
  handleDeleteUser,
  clearFilters,
}) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.toolbar}>
          <div className={styles.clearSearch}>
            <button onClick={clearFilters}>
              پاک کردن فیلترها <UilTimes />
            </button>
          </div>
          <div className={styles.left}>
            {/* <button>استخراج <UilImport /></button> */}

            <div className={styles.filterObj}>
              <p>وضعیت: </p>
              <select
                value={isActiveFilter}
                onChange={e => {
                  setIsActiveFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">همه</option>
                <option value="active">فعال</option>
                <option value="deactive">غیرفعال</option>
              </select>
            </div>

            <div className={styles.filterObj}>
              <p>بیمه: </p>
              <select
                value={insuranceFilter}
                onChange={e => {
                  setInsuranceFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">همه</option>
                <option value="true">دارای بیمه</option>
                <option value="false">بدون بیمه</option>
              </select>
            </div>

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
              <span className={styles.clearSearch} onClick={() => {
                setSearch("");
                setPage(1);
              }}>
                <UilTimes />
              </span>
            )}
          </div>
        </div>
        
        {isMobile ? (
          <AllUsersCard data={users} deleteModal={handleDeleteModal}/>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>ورزشکار</th>
                  <th>تلفن</th>
                  <th>نقش</th>
                  <th>وضعیت</th>
                  <th>تاریخ ثبت نام</th>
                  <th>بیمه</th>
                  <th>تغییرات</th>
                </tr>
              </thead>

              <tbody>
                {users.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{toPersianDigits(index + 1)}</td>
                    <td>
                      <div className={styles.students}>
                        <img src={item.profile_picture} alt={item.full_name} />
                        <div>
                          <strong>{item.full_name}</strong>
                          <p>{toPersianDigits(item.national_id)}</p>
                        </div>
                      </div>
                    </td>
                    <td>{toPersianDigits(item.phone_number)}</td>
                    <td><strong>{roleConverter(item.roles)}</strong></td>
                    <td>
                      <span className={styles.badge}>
                        {item.is_active ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td>{toPersianDigits((item.joined_at || "").split(" ")[0] || "-")}</td>
                    <td>{item.insurance ? `تا ${toPersianDigits(item.insurance_expiry_jalali)}` : 'ندارد'}</td>
                    <td>
                      <div className={styles.btnContainer}>
                        <button onClick={() => navigate(`/dashboard/user-management/${item.id}/edit`)}>
                          <UilEdit />
                        </button>
                        <button onClick={() => handleDeleteModal(item.id)}><UilTrashAlt fill='#C1121F' /></button>
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
                fetchAllUsers(nextPage);
              }
            }}
            onPrev={() => {
              if (prevPage) {
                fetchAllUsers(prevPage);
              }
            }}
            onPageChange={(pageNumber) => {
              setPage(pageNumber);
            }}
          />
        </div>
      </div>
      {deleteModal && (
        <Modal handleModal={handleDeleteModal} height='200px'>
          <div className={styles.deleteModal}>
            <p>آیا از حذف این کاربر مطمئن هستید؟</p>
            <div className={styles.buttons}>
              <button className={styles.deleteBtn} onClick={() => handleDeleteUser(selectedUser)}>حذف</button>
              <button className={styles.cancleBtn} onClick={handleDeleteModal}>لغو</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

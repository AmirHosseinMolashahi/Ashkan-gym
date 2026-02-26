import styles from "./AllUsersSection.module.scss";
import { UilImport, UilEdit, UilTrashAlt, UilTimes } from '@iconscout/react-unicons'
import toPersianDigits from "../../../../hooks/convertNumber";
import roleConverter from "../../../../hooks/roleConverter";
import { useNavigate } from 'react-router-dom';
import Modal from "../../../GlobalComponents/Modal/Modal";

export default function AllUsersSection({
  users,
  page,
  setPage,
  pageSize,
  totalCount,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  isActiveFilter,
  setIsActiveFilter,
  deleteModal,
  handleDeleteModal,
  selectedUser,
  handleDeleteUser,
}) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.toolbar}>
          <div className={styles.left}>
            <button>استخراج <UilImport /></button>

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
              <span className={styles.clearSearch} onClick={() => {
                setSearch("");
                setPage(1);
              }}>
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
                <th>تلفن</th>
                <th>نقش</th>
                <th>وضعیت</th>
                <th>تاریخ ثبت نام</th>
                <th>تغییرات</th>
              </tr>
            </thead>

            <tbody>
              {users.map((item, index) => (
                <tr key={item.id ?? index}>
                  <td>{toPersianDigits((page - 1) * pageSize + index + 1)}</td>
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
                  <td><strong>{roleConverter(item.role)}</strong></td>
                  <td>
                    <span className={styles.badge}>
                      {item.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td>{toPersianDigits((item.joined_at || "").split(" ")[0] || "-")}</td>
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

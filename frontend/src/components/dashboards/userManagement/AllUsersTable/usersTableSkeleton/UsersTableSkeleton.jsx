import styles from "./UsersTableSkeleton.module.scss";

const UsersRowSkeleton = () => {
  return (
    <tr className={styles.skeletonRow}>
      <td>
        <div className={`${styles.bone} ${styles.boneIndex}`} />
      </td>
      <td>
        <div className={styles.students}>
          <div className={`${styles.bone} ${styles.boneAvatar}`} />
          <div className={styles.studentInfo}>
            <div className={`${styles.bone} ${styles.boneName}`} />
            <div className={`${styles.bone} ${styles.boneNationalId}`} />
          </div>
        </div>
      </td>
      <td>
        <div className={`${styles.bone} ${styles.bonePhone}`} />
      </td>
      <td>
        <div className={`${styles.bone} ${styles.boneRole}`} />
      </td>
      <td>
        <div className={`${styles.bone} ${styles.boneBadge}`} />
      </td>
      <td>
        <div className={`${styles.bone} ${styles.boneDate}`} />
      </td>
      <td>
        <div className={`${styles.bone} ${styles.boneInsurance}`} />
      </td>
      <td>
        <div className={styles.btnContainer}>
          <div className={`${styles.bone} ${styles.boneIconBtn}`} />
          <div className={`${styles.bone} ${styles.boneIconBtn}`} />
        </div>
      </td>
    </tr>
  );
};

const UsersTableSkeleton = ({ rows = 7 }) => {
  return (
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
          {Array.from({ length: rows }).map((_, i) => (
            <UsersRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTableSkeleton;
import styles from "./ActivityTableSkeleton.module.scss";

const ActivityRowSkeleton = () => {
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
        <div className={`${styles.bone} ${styles.boneRole}`} />
      </td>
      <td>
        <div className={`${styles.bone} ${styles.boneStatus}`} />
      </td>
      <td>
        <div className={`${styles.bone} ${styles.boneBadge}`} />
      </td>
      <td>
        <div className={`${styles.bone} ${styles.boneDate}`} />
      </td>
      <td>
        <div className={styles.btnContainer}>
          <div className={`${styles.bone} ${styles.boneIconBtn}`} />
        </div>
      </td>
    </tr>
  );
};

const ActivityTableSkeleton = ({ rows = 10 }) => {
  return (
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
          {Array.from({ length: rows }).map((_, i) => (
            <ActivityRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTableSkeleton;
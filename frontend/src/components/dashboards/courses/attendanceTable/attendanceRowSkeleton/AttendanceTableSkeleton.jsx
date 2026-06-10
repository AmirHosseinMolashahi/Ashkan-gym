import styles from "./AttendanceTableSkeleton.module.scss";


const AttendanceRowSkeleton = () => {
  return (
    <tr className={styles.skeletonRow}>
      <td>
        <div className={`${styles.bone} ${styles.boneShort}`} />
      </td>
      <td>
        <div className={styles.studentSkeleton}>
          <div className={`${styles.bone} ${styles.boneAvatar}`} />
          <div className={styles.studentInfo}>
            <div className={`${styles.bone} ${styles.boneName}`} />
            <div className={`${styles.bone} ${styles.boneId}`} />
          </div>
        </div>
      </td>
      <td>
        <div className={styles.btnGroup}>
          <div className={`${styles.bone} ${styles.boneBtn}`} />
          <div className={`${styles.bone} ${styles.boneBtn}`} />
          <div className={`${styles.bone} ${styles.boneBtn}`} />
        </div>
      </td>
      <td>
        <div className={`${styles.bone} ${styles.boneInput}`} />
      </td>
    </tr>
  );
};


const AttendanceTableSkeleton = ({ rows = 5 }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ردیف</th>
            <th>ورزشکار</th>
            <th>حضور غیاب</th>
            <th>توضیحات</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <AttendanceRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTableSkeleton;
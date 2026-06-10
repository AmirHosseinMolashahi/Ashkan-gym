import styles from "./StudentsTableSkeleton.module.scss";

const StudentsTableSkeleton = ({ rows = 6 }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ردیف</th>
            <th>ورزشکار</th>
            <th>وضعیت</th>
            <th>تلفن</th>
            <th>حضور غیاب</th>
            <th>وضعیت شهریه</th>
            <th>تغییرات</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i}>

              {/* ردیف */}
              <td className={styles.tableIndex}>
                <div className={`${styles.skIndex} ${styles.pulse}`} />
              </td>

              {/* ورزشکار */}
              <td>
                <div className={styles.students}>
                  <div className={`${styles.skAvatar} ${styles.pulse}`} />
                  <div className={styles.skStudentInfo}>
                    <div className={`${styles.skName} ${styles.pulse}`} />
                    <div className={`${styles.skNationalId} ${styles.pulse}`} />
                  </div>
                </div>
              </td>

              {/* وضعیت */}
              <td>
                <div className={`${styles.skStatus} ${styles.pulse}`} />
              </td>

              {/* تلفن */}
              <td>
                <div className={`${styles.skPhone} ${styles.pulse}`} />
              </td>

              {/* حضور غیاب */}
              <td>
                <div className={`${styles.skAttendance} ${styles.pulse}`} />
              </td>

              {/* وضعیت شهریه */}
              <td>
                <div className={`${styles.skBadge} ${styles.pulse}`} />
              </td>

              {/* تغییرات */}
              <td>
                <div className={`${styles.skBtn} ${styles.pulse}`} />
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTableSkeleton;
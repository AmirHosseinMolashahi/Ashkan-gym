import styles from "./AttendanceCardSkeleton.module.scss";

const AttendanceCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={`${styles.bone} ${styles.boneAvatar}`} />
        <div className={styles.info}>
          <div className={`${styles.bone} ${styles.boneName}`} />
          <div className={`${styles.bone} ${styles.boneId}`} />
        </div>
      </div>
      <div className={styles.cardInfo}>
        <div className={styles.btnContainer}>
          <div className={`${styles.bone} ${styles.boneBtn}`} />
          <div className={`${styles.bone} ${styles.boneBtn}`} />
          <div className={`${styles.bone} ${styles.boneBtn}`} />
        </div>
        <div className={styles.inputContainer}>
          <div className={`${styles.bone} ${styles.boneInput}`} />
        </div>
      </div>
    </div>
  );
};

export default AttendanceCardSkeleton;
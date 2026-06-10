import styles from "./ClassListSkeleton.module.scss";

const ClassRowSkeleton = () => {
  return (
    <article className={styles.classRow}>
      <div className={styles.classInfo}>

        <div className={styles.classTitle}>
          <div className={`${styles.bone} ${styles.boneTitle}`} />
          <div className={styles.classStatus}>
            <div className={`${styles.bone} ${styles.boneBadge}`} />
            <div className={`${styles.bone} ${styles.boneBadge}`} />
          </div>
        </div>

        <div className={`${styles.bone} ${styles.boneCoach}`} />
        <div className={`${styles.bone} ${styles.boneLine}`} />
        <div className={`${styles.bone} ${styles.boneLine}`} />
        <div className={`${styles.bone} ${styles.boneLineLong}`} />

      </div>

      <div className={styles.actions}>
        <div className={`${styles.bone} ${styles.boneAction}`} />
      </div>
    </article>
  );
};

const ClassListSkeleton = ({ count = 4 }) => {
  return (
    <div className={styles.classList}>
      {Array.from({ length: count }).map((_, i) => (
        <ClassRowSkeleton key={i} />
      ))}
    </div>
  );
};

export default ClassListSkeleton;
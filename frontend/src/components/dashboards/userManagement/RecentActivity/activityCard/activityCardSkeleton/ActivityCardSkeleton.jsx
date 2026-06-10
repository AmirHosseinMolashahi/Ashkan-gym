import styles from "./ActivityCardSkeleton.module.scss";

const ActivityCardItemSkeleton = () => {
  return (
    <div className={styles.card}>

      <div className={styles.cardHeader}>
        <div className={styles.userInfo}>
          <div className={`${styles.bone} ${styles.boneAvatar}`} />
          <div className={styles.userInfoText}>
            <div className={`${styles.bone} ${styles.boneName}`} />
            <div className={`${styles.bone} ${styles.boneNationalId}`} />
          </div>
        </div>
        <div className={styles.cardActions}>
          <div className={`${styles.bone} ${styles.boneIconBtn}`} />
        </div>
      </div>

      <div className={styles.statusContainer}>
        <div className={`${styles.bone} ${styles.boneBadge}`} />
        <div className={`${styles.bone} ${styles.boneBadge}`} />
        <div className={`${styles.bone} ${styles.boneTime}`} />
      </div>

      <div className={styles.cardInfo}>
        <div className={`${styles.bone} ${styles.boneInfoTitle}`} />
        <div className={`${styles.bone} ${styles.boneInfoValue}`} />
      </div>

    </div>
  );
};

const ActivityCardSkeleton = ({ count = 8 }) => {
  return (
    <div className={styles.usersCard}>
      {Array.from({ length: count }).map((_, i) => (
        <ActivityCardItemSkeleton key={i} />
      ))}
    </div>
  );
};

export default ActivityCardSkeleton;
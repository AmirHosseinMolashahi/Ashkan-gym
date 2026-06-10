// ClassContentSkeleton.jsx
import styles from './ClassSessionSkeleton.module.scss';

const SESSION_COUNT = 13;
const COURSE_COUNT = 2;   // تعداد کارت‌های راست رو اینجا تنظیم کن
const LEFT_LIST_COUNT = 5;

const RightItemSkeleton = () => (
  <div className={styles.rightContItem}>
    <div className={styles.classInfo}>
      <div className={styles.avatar} />
      <div className={styles.baseInfo}>
        <div className={styles.titleLine} />
        <div className={styles.infoLine} />
        <div className={styles.infoLine} style={{ width: '55%' }} />
      </div>
    </div>

    <div className={styles.divider} />

    <div className={styles.sectionTitle} />

    <ul className={styles.sessionDate}>
      {Array.from({ length: SESSION_COUNT }).map((_, i) => (
        <li key={i} className={styles.sessionItem}>
          <div className={styles.sessionDay} />
          <div className={styles.sessionNum} />
        </li>
      ))}
    </ul>
  </div>
);

const ClassSessionSkeleton = () => {
  return (
    <div className={styles.classContent}>

      {/* Right */}
      <div className={styles.rightContent}>
        {Array.from({ length: COURSE_COUNT }).map((_, i) => (
          <RightItemSkeleton key={i} />
        ))}
      </div>

      {/* Left */}
      {/* <div className={styles.leftContent}>
        <div className={styles.leftContHeader}>
          <div className={styles.leftHeaderTitle} />
          <div className={styles.leftHeaderSub} />
        </div>

        <div className={styles.leftContItem}>
          <div className={styles.leftItemTitle} />
          <ul className={styles.leftList}>
            {Array.from({ length: LEFT_LIST_COUNT }).map((_, i) => (
              <li key={i} className={styles.leftListItem}>
                <div className={styles.leftListLabel} />
                <div className={styles.leftListBadge} />
              </li>
            ))}
          </ul>
        </div>
      </div> */}

    </div>
  );
};

export default ClassSessionSkeleton;
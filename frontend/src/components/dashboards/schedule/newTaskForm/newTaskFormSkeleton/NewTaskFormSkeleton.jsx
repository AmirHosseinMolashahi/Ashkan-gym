// NewTaskFormSkeleton.jsx
import styles from './NewTaskFormSkeleton.module.scss';

export default function NewTaskFormSkeleton() {
  return (
    <div className={styles.overlay}>
      <div className={styles.topBar}>
        <div className={styles.topBarCenter}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonSub} />
        </div>
      </div>

      <div className={styles.body}>
        {/* عنوان */}
        <div className={styles.field}>
          <div className={styles.skeletonLabel} />
          <div className={styles.skeletonInput} />
        </div>

        {/* توضیحات */}
        <div className={styles.field}>
          <div className={styles.skeletonLabel} />
          <div className={styles.skeletonTextarea} />
        </div>

        {/* دسته‌بندی */}
        <div className={styles.field}>
          <div className={styles.skeletonLabel} />
          <div className={styles.chips}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.skeletonChip} />
            ))}
          </div>
        </div>

        {/* تاریخ و ساعت */}
        <div className={styles.row}>
          <div className={styles.field}>
            <div className={styles.skeletonLabel} />
            <div className={styles.skeletonInput} />
          </div>
          <div className={styles.field}>
            <div className={styles.skeletonLabel} />
            <div className={styles.skeletonInput} />
          </div>
        </div>

        {/* اولویت */}
        <div className={styles.field}>
          <div className={styles.skeletonLabel} />
          <div className={styles.priorities}>
            <div className={styles.skeletonPriority} />
            <div className={styles.skeletonPriority} />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.skeletonSaveBtn} />
        <div className={styles.skeletonCancelBtn} />
      </div>
    </div>
  );
}
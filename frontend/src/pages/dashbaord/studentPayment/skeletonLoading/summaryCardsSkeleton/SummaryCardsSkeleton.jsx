import style from "./SummaryCardsSkeleton.module.scss";

export default function SummaryCardsSkeleton() {
  return (
    <div className={style.summaryGrid}>
      <div className={style.summaryRow}>
        <article className={style.summaryCard}>
          <div className={`${style.skeletonLine} ${style.title}`} />
          <div className={`${style.skeletonLine} ${style.value}`} />
          <div className={`${style.skeletonLine} ${style.badge}`} />
        </article>
        <article className={style.summaryCard}>
          <div className={`${style.skeletonLine} ${style.title}`} />
          <div className={`${style.skeletonLine} ${style.value}`} />
          <div className={`${style.skeletonLine} ${style.badge}`} />
        </article>
      </div>
      <article className={`${style.summaryCard} ${style.warningCard}`}>
        <div className={`${style.skeletonLine} ${style.title}`} />
        <div className={`${style.skeletonLine} ${style.value}`} />
        <div className={`${style.skeletonLine} ${style.badge}`} />
      </article>
    </div>
  );
}

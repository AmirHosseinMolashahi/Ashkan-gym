import style from "./InvoiceTableSkeleton.module.scss";

function SkeletonRow() {
  return (
    <article className={style.row}>
      <div className={style.classInfo}>
        <div className={style.classIcon} />
        <div className={style.classInfoText}>
          <div className={`${style.sk} ${style.skTitle}`} />
          <div className={`${style.sk} ${style.skSub}`} />
          <div className={`${style.sk} ${style.skSchedule}`} />
        </div>
      </div>
      <div className={style.column}>
        <div className={`${style.sk} ${style.skBadge}`} />
        <div className={style.amountCol}>
          <div className={`${style.sk} ${style.skLabel}`} />
          <div className={`${style.sk} ${style.skAmount}`} />
          <div className={`${style.sk} ${style.skDate}`} />
        </div>
      </div>
      <div className={style.actions}>
        <div className={`${style.sk} ${style.skBtn}`} />
      </div>
    </article>
  );
}

export default function InvoiceTableSkeleton({ rows = 2 }) {
  return (
    <section className={style.tableWrap}>
      <div className={style.tableHead}>
        <div className={`${style.sk} ${style.skHeadCell}`} />
        <div className={`${style.sk} ${style.skHeadCell}`} />
        <div className={`${style.sk} ${style.skHeadCell}`} />
        <div className={`${style.sk} ${style.skHeadCell}`} />
      </div>
      <div className={style.tableBody}>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </section>
  );
}

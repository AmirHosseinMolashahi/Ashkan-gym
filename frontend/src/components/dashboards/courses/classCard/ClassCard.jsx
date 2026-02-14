import style from "./ClassCard.module.scss";

const ClassCard = ({
  status = "Active",
  title,
  coach,
  age_ranges,
  gender,
  students,
  schedule,
  hours,
  onView,
}) => {
  return (
    <div className={style.card}>
      {/* top border */}
      <div className={`${style.topBorder} ${style[status.toLowerCase()]}`} />

      <div className={style.header}>
        <span className={`${style.badge} ${style[status.toLowerCase()]}`}>
          {status === 'active' ? 'فعال' : 'غیرفعال'}
        </span>
        <span className={style.menu}>⋯</span>
      </div>

      <h3 className={style.title}>{title}</h3>
      <h4 className={style.coachName}>مربی: {coach}</h4>
      <p className={style.subtitle}>
        {age_ranges.map((i, n) => {
          return(<span> {i.title} </span>)
        })} - {gender}
      </p>

      <div className={style.info}>
        <div>👥 ورزشکار {students}</div>
        <div>📅 {schedule}</div>
        <div>⏱ هر جلسه {hours}</div>
      </div>

      <button className={style.button} onClick={onView}>
        نمایش جزئیات
      </button>
    </div>
  );
};

export default ClassCard;

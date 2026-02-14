import style from "./FilterBar.module.scss";

const FilterBar = ({
  subjects = [],
  statuses = [],
  onSubjectChange,
  onStatusChange,
  onSearch,
}) => {
  return (
    <div className={style.filterBar}>
      <button className={style.filterBtn}>
        <span>⚙</span>
      </button>

      <select
        className={style.select}
        onChange={(e) => onSubjectChange(e.target.value)}
      >
        <option value="">همه کلاس ها</option>
        {subjects.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>

      <select
        className={style.select}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">همه وضعیت ها</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <div className={style.searchBox}>
        <input
          type="text"
          placeholder="جستجوی کلاس ها..."
          onChange={(e) => onSearch(e.target.value)}
        />
        <span className={style.searchIcon}>🔍</span>
      </div>
    </div>
  );
};

export default FilterBar;

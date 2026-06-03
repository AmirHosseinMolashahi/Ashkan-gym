import { useState, useMemo } from "react";
import styles from "./RecipientsGroupSection.module.scss";
import toPersianDigits from "../../../../../hooks/convertNumber";
import roleConverter from "../../../../../hooks/roleConverter";
import { UilPlusCircle, UilCheckCircle } from '@iconscout/react-unicons';

const TABS = [
  { id: "classes", label: "کلاس‌ها" },
  { id: "roles", label: "نقش‌ها" },
  { id: "students", label: "دانش‌آموزان" },
];

function Avatar({ name, size = "md" }) {
  const initials = name?.slice(0, 1) || "؟";
  const colors = ["#6c63ff", "#f4426c", "#00bcd4", "#43a047", "#ff9800"];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  return (
    <span
      className={`${styles.avatar} ${styles[`avatar--${size}`]}`}
      style={{ background: color }}
    >
      {initials}
    </span>
  );
}

function Badge({ label, color = "purple", onRemove }) {
  return (
    <span className={`${styles.badge} ${styles[`badge--${color}`]}`}>
      {label}
      {onRemove && (
        <button className={styles.badgeRemove} onClick={onRemove} type="button">
          ×
        </button>
      )}
    </span>
  );
}

export default function RecipientsGroupSection({ 
  courses,
  roles,
  users,
  announcementOn,
  setAnnouncementOn,
  selected,
  setSelected,
  onChange
  }) {
  const [activeTab, setActiveTab] = useState("classes");
  const [search, setSearch] = useState("");

  const currentData = useMemo(() => {
    const map = { classes: courses, roles: roles, students: users };
    const items = map[activeTab] || [];
    if (!search.trim()) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeTab, search]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const tab = prev[activeTab];
      const next = tab.includes(id) ? tab.filter((x) => x !== id) : [...tab, id];
      const updated = { ...prev, [activeTab]: next };
      onChange?.(updated);
      return updated;
    });
  };

  const isSelected = (id) => selected[activeTab].includes(id);

  const totalSelected = Object.values(selected).flat().length;

  return (
    <section className={styles.wrapper} dir="rtl">
      {/* Header */}
      <header className={styles.header}>
        <span className={styles.headerIcon}>👥</span>
        <h2 className={styles.title}>دریافت کنندگان</h2>
        {totalSelected > 0 && (
          <span className={styles.selectedCount}>{totalSelected} انتخاب شده</span>
        )}
      </header>

      {/* Announcement Toggle */}
      <div className={styles.announcementRow}>
        <div className={styles.announcementInfo}>
          <span className={styles.announcementTitle}>اعلان سراسری</span>
        </div>
        <button
          type="button"
          className={`${styles.toggle} ${announcementOn ? styles.toggleOn : ""}`}
          onClick={() => setAnnouncementOn((v) => !v)}
          aria-label="toggle announcement"
        >
          <span className={styles.toggleThumb} />
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchRow}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="جستجوی کلاس، نقش، کلاس یا ورزشکار..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={() => setSearch("")}
          >
            ×
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => {
          const count = selected[tab.id].length;
          return (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {count > 0 && <span className={styles.tabBadge}>{toPersianDigits(count)}</span>}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className={styles.list}>
        {currentData.length === 0 && (
          <div className={styles.empty}>موردی یافت نشد</div>
        )}

        {activeTab === "classes" &&
          currentData.map((item) => (
            <label key={item.id} className={`${styles.listItem} ${isSelected(item.id) ? styles.listItemSelected : ""}`}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={isSelected(item.id)}
                onChange={() => toggleSelect(item.id)}
              />
              <span className={styles.checkCustom}>
                {isSelected(item.id) && <span className={styles.checkMark}>✓</span>}
              </span>
              <img src={item.avatar} className={styles.avatar}/>
              <span className={styles.itemContent}>
                <span className={styles.itemName}>{item.title} <span className={styles.itemGender}>{item.gender === 'male' ? 'آقایان' : 'بانوان'}</span></span>
                <span className={styles.itemMeta}>{toPersianDigits(item.active_students)} نفر</span>
              </span>
              <span className={`${styles.statusDot} ${styles[`statusDot--${item.status}`]}`} />
            </label>
          ))}

        {activeTab === "roles" &&
          currentData.map((item) => (
            <label key={item.id} className={`${styles.listItem} ${isSelected(item.id) ? styles.listItemSelected : ""}`}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={isSelected(item.id)}
                onChange={() => toggleSelect(item.id)}
              />
              <span className={styles.checkCustom}>
                {isSelected(item.id) && <span className={styles.checkMark}>✓</span>}
              </span>
              <Avatar name={roleConverter(item.name)} size="sm" />
              <span className={styles.itemContent}>
                <span className={styles.itemName}>{roleConverter(item.name)}</span>
                <span className={styles.itemMeta}>{item.role}</span>
              </span>
              <Badge label={isSelected(item.id) ? "انتخاب شده" : "انتخاب"} color={isSelected(item.id) ? "purple" : "gray"} />
            </label>
          ))}

        {activeTab === "students" &&
          currentData.map((item) => (
            <label key={item.id} className={`${styles.listItem} ${isSelected(item.id) ? styles.listItemSelected : ""}`}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={isSelected(item.id)}
                onChange={() => toggleSelect(item.id)}
              />
              <span className={styles.checkCustom}>
                {isSelected(item.id) && <span className={styles.checkMark}>✓</span>}
              </span>
              <img src={item.profile_picture} size="sm" className={styles.avatar}/>
              <span className={styles.itemContent}>
                <span className={styles.itemName}>{item.full_name}</span>
                <span className={styles.itemMeta} style={{ direction: "ltr", textAlign: "right" }}>{toPersianDigits(item.national_id)}</span>
              </span>
              <Badge label={isSelected(item.id) ? <UilCheckCircle /> : <UilPlusCircle />} color={isSelected(item.id) ? "green" : "gray"} />
            </label>
          ))}
      </div>
    </section>
  );
}

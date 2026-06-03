import React, { useState } from 'react';
import styles from './SideSection.module.scss';
import WeeklyCalendar from '../../weeklyCalendar/WeeklyCalendar';
import useCurrentDateTime from '../../../../hooks/currentDateTime';
import toPersianDigits from '../../../../hooks/convertNumber';
import ScheduleWidgetSkeleton from './scheduleWidgetSkeleton/ScheduleWidgetSkeleton';

export const SCHEDULE_TAG = {
  'تمرینی': { tagColor: '#22c55e', color: '#dcfce7' },
  'مالی': { tagColor: '#4361ee', color: '#eef0fd' },
};


const SideSection = ({tasks, loading}) => {
  const {date} = useCurrentDateTime();

  return (
    <aside className={styles.sidebar}>
      <WeeklyCalendar taskDates={tasks.map(i => i.date_jalali)} onDaySelect={(date) => console.log('انتخاب شد:', date)} />
      {loading ? <ScheduleWidgetSkeleton /> : <ScheduleWidget tasks={tasks.filter((item) => item.date_jalali === date)}/>}
      {/* <QuickAddWidget /> */}
    </aside>
  );
};

const ScheduleWidget = ({tasks}) => (
  <div className={styles.widget}>
    <div className={styles.widgetHeader}>
      <div className={styles.widgetHeaderLeft}>
        <span className={styles.eventBadge}>{toPersianDigits(tasks.length)} رویداد</span>
      </div>
      <div className={styles.widgetHeaderRight}>
        <span className={styles.widgetIcon}>📅</span>
        <span className={styles.widgetTitle}>برنامه امروز</span>
      </div>
    </div>
    <div className={styles.scheduleList}>
      {tasks.map((item) => (
        <div key={item.id} className={styles.scheduleItem} style={{ background: SCHEDULE_TAG[item.category.name]?.color }}>
          <div className={styles.scheduleInfo}>
            <span className={styles.scheduleTitle}>{item.title}</span>
            <span className={styles.scheduleTag} style={{ color: SCHEDULE_TAG[item.category.name]?.tagColor }}>
              {item.tag}
            </span>
          </div>
          <span className={styles.scheduleTime}>{toPersianDigits(item.time)}</span>
        </div>
      ))}
    </div>
  </div>
);

// const QuickAddWidget = () => (
//   <div className={styles.widget}>
//     <div className={styles.widgetHeader}>
//       <button className={styles.addCircleBtn}>+</button>
//       <span className={styles.widgetTitle}>افزودن سریع</span>
//     </div>
//     <div className={styles.quickForm}>
//       <input
//         type="text"
//         placeholder="عنوان یادآور..."
//         className={styles.quickInput}
//       />
//       <div className={styles.quickRow}>
//         <div className={styles.quickMeta}>
//           <span className={styles.metaIcon}>📅</span>
//           <span className={styles.metaLabel}>تاریخ</span>
//         </div>
//         <div className={styles.quickMeta}>
//           <span className={styles.metaIcon}>⏰</span>
//           <span className={styles.metaLabel}>ساعت</span>
//         </div>
//       </div>
//       <button className={styles.quickSubmit}>
//         <span>+</span>
//         <span>افزودن یادآور</span>
//       </button>
//     </div>
//   </div>
// );

export default SideSection;

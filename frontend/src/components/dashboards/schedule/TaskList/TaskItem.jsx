import React from 'react';
import styles from './TaskItem.module.scss';
import toPersianDigits from '../../../../hooks/convertNumber';


export const TAG_COLORS = {
  مالی: { bg: '#eef0fd', text: '#4361ee' },
  تمرینی: { bg: '#fff3e0', text: '#f97316' },
  جلسه: { bg: '#dcfce7', text: '#22c55e' },
  اعلان: { bg: '#f1f5f9', text: '#64748b' },
  گزارش: { bg: '#f3e8ff', text: '#9333ea' },
};


const TaskItem = ({ task, onToggle, onDelete, onEdit }) => {
  const tagStyle = TAG_COLORS[task.category.name] || { bg: '#f1f5f9', text: '#64748b' };

  return (
    <div className={`${styles.taskItem} ${task.finished ? styles.done : ''}`}>
      <div className={styles.right}>
        <button
          className={`${styles.checkbox} ${task.finished ? styles.checked : ''}`}
          onClick={() => !task.finished ? onToggle(task.id) : ''}
          aria-label="تغییر وضعیت"
        >
          {task.finished && <span className={styles.checkIcon}>✓</span>}
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{task.title}</h3>
          <div className={styles.meta}>
            {task.priority && <span className={styles.priorityFlag}>🚩</span>}
            <span
              className={styles.tag}
              style={{ background: tagStyle.bg, color: tagStyle.text }}
            >
              {task.category.name}
            </span>
          </div>
        </div>
        {task.descriptions && (
          <p className={styles.description}>{task.descriptions}</p>
        )}
      </div>

      <div className={styles.left}>
        <div className={styles.timeRow}>
          <span className={styles.timeIcon}>⏰</span>
          <span className={styles.time}>{toPersianDigits(task.time)}</span>
        </div>
        <div className={styles.timeRow}>
          <span className={styles.timeIcon}>📅</span>
          <span className={styles.time}>{toPersianDigits(task.date_jalali)}</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => onDelete(task)} aria-label="حذف">
            🗑️
          </button>
          <button className={styles.actionBtn} onClick={() => onEdit(task.id)} aria-label="ویرایش">
            ✏️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;

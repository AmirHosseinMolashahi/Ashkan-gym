import React, { useMemo } from 'react';
import styles from './TaskList.module.scss';
import TaskItem from './TaskItem';
import { isToday, isTomorrow, isPast, parseISO } from "date-fns";
import { faIR } from "date-fns/locale";
import TaskListSkeleton from '../taskListSkeleton/TaskListSkeleton';



const GROUPS = {
  TODAY: 'امروز',
  TOMORROW: 'فردا',
  UPCOMING: 'آینده',
  OLDER: 'قدیمی‌تر',
};

const ORDER = [GROUPS.TODAY, GROUPS.TOMORROW, GROUPS.UPCOMING, GROUPS.OLDER];

const GROUP_ICONS = {
  [GROUPS.TODAY]: '☀️',
  [GROUPS.TOMORROW]: '📅',
  [GROUPS.UPCOMING]: '📦',
  [GROUPS.OLDER]: '✔️',
};


export function groupTasks(tasks) {
  const grouped = {
    [GROUPS.TODAY]: [],
    [GROUPS.TOMORROW]: [],
    [GROUPS.UPCOMING]: [],
    [GROUPS.OLDER]: [],
  };

  tasks.forEach((task) => {
    const date = new Date(task.date);

    if (isToday(date)) {
      grouped[GROUPS.TODAY].push(task);
    } else if (isTomorrow(date)) {
      grouped[GROUPS.TOMORROW].push(task);
    } else if (!isPast(date)) {
      grouped[GROUPS.UPCOMING].push(task);
    } else {
      grouped[GROUPS.OLDER].push(task);
    }
  });

  return ORDER
    .filter((label) => grouped[label].length > 0)
    .map((label) => ({ label, tasks: grouped[label] }));
}


const TaskGroup = ({ label, tasks, onToggle, onDelete, onEdit }) => (
  <div className={styles.group}>
    <div className={styles.groupHeader}>
      <span className={styles.groupIcon}>{GROUP_ICONS[label] || '📌'}</span>
      <span className={styles.groupLabel}>{label}</span>
    </div>
    <div className={styles.groupTasks}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  </div>
);

const TaskList = ({ tasks, onToggle, onDelete, onEdit, loading }) => {

  const orderedGroups = useMemo(() => groupTasks(tasks), [tasks]);

  if (loading) {
    return <TaskListSkeleton />
  }

  if (orderedGroups.length === 0) {
    return <div className={styles.empty}>هیچ تسکی وجود نداره</div>;
  }

  return (
    <div className={styles.taskList}>
      {orderedGroups.map((group) => (
        <TaskGroup
          key={group.label}
          label={group.label}
          tasks={group.tasks}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default TaskList;

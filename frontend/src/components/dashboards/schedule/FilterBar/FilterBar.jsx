import React from 'react';
import styles from './FilterBar.module.scss';

export const FILTER_TABS = [
  { id: 'all', label: 'همه'},
  { id: 'false', label: 'انجام نشده' }
];


const FilterBar = ({ finishedFilter, setFinishedFilter, searchQuery, setSearchQuery, priorityFilter, setPriorityFilter }) => {
  return (
    <div className={styles.filterBar}>
      <div className={styles.topRow}>
        <div className={styles.tabs}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${finishedFilter === tab.id ? styles.activeTab : ''}`}
              onClick={() => setFinishedFilter(tab.id)}
            >
              <span>{tab.label}</span>
              {/* <span className={`${styles.badge} ${activeFilter === tab.id ? styles.activeBadge : ''} ${tab.id === 'urgent' ? styles.urgentBadge : ''}`}>
                {tab.count}
              </span> */}
            </button>
          ))}
        </div>
        <button 
          className={`${styles.urgentTab} ${styles.tab} ${priorityFilter === true ? styles.activeTab : ''}`}
          onClick={() => {
            priorityFilter === true
            ? setPriorityFilter('all')
            : setPriorityFilter(true)
          }}
        >
          <span>اولویت 🚩</span>
        </button>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="جستجو در یادآورها..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

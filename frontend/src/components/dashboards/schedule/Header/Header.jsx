import React from 'react';
import styles from './Header.module.scss';
import useCurrentDateTime from '../../../../hooks/currentDateTime';
import toPersianDigits from '../../../../hooks/convertNumber';

const Header = ({ onAddNew }) => {

  const {date, weekday} = useCurrentDateTime()

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>یادآورها و برنامه روزانه</h1>
        <span className={styles.subtitle}>{weekday}, {toPersianDigits(date)}</span>
      </div>
      <button className={styles.addBtn} onClick={onAddNew}>
        <span className={styles.addIcon}>+</span>
        <span>یادآور جدید</span>
      </button>
    </header>
  );
};

export default Header;

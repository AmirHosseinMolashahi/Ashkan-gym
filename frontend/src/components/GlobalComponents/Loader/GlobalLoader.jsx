import React from 'react'
import { useLoading } from '../../../context/LoadingContext';
import styles from './GlobalLoader.module.scss';

const GlobalLoader = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className={styles.globalLoader}>
      <div className={styles.spinner}></div>
    </div>
  )
}

export default GlobalLoader;
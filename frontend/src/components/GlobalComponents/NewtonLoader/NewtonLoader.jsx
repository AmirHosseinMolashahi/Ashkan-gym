import React from 'react'
import style from './NewtonLoader.module.scss';
import { useLoading } from '../../../context/LoadingContext';


const NewtonLoader = () => {
  const { isLoading } = useLoading();
  
  if (!isLoading) return null;

  return (
    <div className={style.loader}>
      <div className={style.gooey}>
        <span className={style.dot}></span>
        <div className={style.dots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}

export default NewtonLoader
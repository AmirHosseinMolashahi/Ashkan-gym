import React from 'react'
import { Outlet } from 'react-router-dom'
import style from './HomeLayouts.module.scss';

const HomeLayouts = () => {
  return (
    <div className={style.home}>
        <div className={style.content}>
            <Outlet />
        </div>
    </div>
  )
}

export default HomeLayouts
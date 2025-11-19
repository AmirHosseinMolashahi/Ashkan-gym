import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/dashboards/Sidebar/Sidebar'
import Navbar from '../../components/dashboards/navbar/Navbar'
import style from './DashboardLayouts.module.scss';

const DashboardLayouts = () => {
  return (
    <div className={style.dashboard}>
        <Sidebar />
        <main className={style.main}>
          <Navbar />
          <Outlet />
        </main>
    </div>
  )
}

export default DashboardLayouts
import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/dashboards/Sidebar/Sidebar'
import Navbar from '../../components/dashboards/navbar/Navbar'
import style from './DashboardLayouts.module.scss';
import Breadcrumbs from '../../components/dashboards/breadcrumbs/BreadCrumbs';
import BackButton from '../../components/dashboards/backButton/BackButton';

const DashboardLayouts = () => {
  return (
    <div className={style.dashboard}>
        <Sidebar />
        <main className={style.main}>
          <Navbar />
          <Breadcrumbs />
          <div className={style.content}>
            <Outlet />
          </div>
        </main>
    </div>
  )
}

export default DashboardLayouts
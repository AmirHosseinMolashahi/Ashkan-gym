import React, { useState, useRef, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/dashboards/Sidebar/Sidebar'
import Navbar from '../../components/dashboards/navbar/Navbar'
import style from './DashboardLayouts.module.scss';
import Breadcrumbs from '../../components/dashboards/breadcrumbs/BreadCrumbs';
import BackButton from '../../components/dashboards/backButton/BackButton';
import { useLocation } from 'react-router-dom';

const DashboardLayouts = () => {
  const [sidebarToggle, setSidebarToggle] = useState(false)
  const sidebarRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarToggle(false);
      }
    }

    if (sidebarToggle) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarToggle]);

  useEffect(() => {
    setSidebarToggle(false);
  }, [location.pathname]);

  return (
    <div className={style.dashboard}>
      {sidebarToggle && (
        <div
          className={style.overlay}
          onClick={() => setSidebarToggle(false)}
        />
      )}
      <Sidebar ref={sidebarRef} sidebarToggle={sidebarToggle} setSidebarToggle={setSidebarToggle}/>
      <main className={style.main}>
        <Navbar sidebarToggle={sidebarToggle} setSidebarToggle={setSidebarToggle}/>
        <div className={style.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayouts
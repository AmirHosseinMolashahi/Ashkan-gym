import React, { useState, useEffect, useRef } from 'react';
import style from './Navbar.module.scss';
import { UilBell, UilUser } from '@iconscout/react-unicons'
import api from '../../../hooks/api';
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {

  const { unreadCount, loading, unreadList } = useSelector(
    state => state.notifications
  );

  const [notifListDisplay, setNotifListDisplay] = useState(false)
  const wrapperRef = useRef()
  const navigate = useNavigate()
  const location = useLocation()

  const appLocations = {
    '/dashboard' : 'داشبورد',
    '/dashboard/announcements' : 'اطلاعیه ها',
    '/dashboard/schedule' : 'تقویم',
    '/dashboard/profile': 'پروفایل',
    '/dashboard/notifications': 'اعلان ها',
  }

  console.log(location.pathname)


  const handleNavigate = () => {
    navigate('/dashboard/notifications');
    setNotifListDisplay(!notifListDisplay)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setNotifListDisplay(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <nav className={style.navbar}>
      <div className={style.container}>
        <h1>
          {appLocations[location.pathname]}
        </h1>
        <div className={style.notifContainer}>
          <div className={style.search}>
            <input type="text" className={style.search__input} placeholder="دنبال چی میگردی؟" />
              <button className={style.search__button}>
                <svg className={style.search__icon} aria-hidden="true" viewBox="0 0 24 24">
                  <g>
                    <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                  </g>
                </svg>
              </button>
          </div>
          <div className={style.icons} ref={wrapperRef}>
            <UilBell fill="#616161" onClick={() => setNotifListDisplay(!notifListDisplay)} />
            {unreadCount > 0 && (
              <span className={style.notifCounter}>
                {unreadCount > 4 ? '+4' : unreadCount}
              </span>
            )}
            {notifListDisplay && (
              <div className={style.notifList}>
                <div className={style.header}>
                  <h3>اعلان های خوانده نشده</h3>
                  <button onClick={() => handleNavigate()}>لیست اعلان ها</button>
                </div>
                <div className={style.body}>
                    {unreadList.length > 0 ? (
                      <ul>
                      {
                        unreadList.map((item, index) => {
                          return(
                            <li key={index}>{item.title}</li>
                          )
                        })
                      }
                    </ul>
                    ) : (
                      <p>در حال حاضر اعلانی برای نمایش وجود ندارد!</p>
                    )}
                </div>
              </div>
            )}
          </div>
          <div className={style.icons}><UilUser fill="#616161" /></div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;
import React from 'react';
import css from './Sidebar.module.scss';
// import logoPic from '../../../assets/dashbaord/logo.jpg';
import { UilHome, UilUser, UilSetting, UilSignOutAlt, UilCalendar, UilDumbbell , UilUserSquare   } from '@iconscout/react-unicons';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useNotification } from '../../../context/notificationContext';
import { useLoading } from '../../../context/LoadingContext';


const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const location = useLocation();
  const {showLoading, hideLoading} = useLoading();
  
  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    showLoading()
    try{
      await logout();
      navigate('/login');
      notify('با موفقیت خارج شدید!', 'info');
    } finally {
      hideLoading()
    }
  };

  const navItem = [
    { title: "داشبورد", icon: <UilHome />, link: "/dashboard" },
    { title: "کلاس ها", icon: <UilDumbbell  />, link: "/transaction" },
    { title: "مربیان", icon: <UilUserSquare />, link: "/schedule" },
    { title: "ورزشکاران", icon: <UilUser />, link: "/users" },
    { title: "تقویم", icon: <UilCalendar />, link: "/schedule" },
    { title: "تنطیمات", icon: <UilSetting />, link: "/settings" },
    { title: "خروج", icon: <UilSignOutAlt />, onClick: handleLogout }  // دیگه لینک نداره، onClick داره
  ];

  return (
    <div className={css.sidebar}>
      <div className={css.logo}>
        <div>
          <img src={user?.profile_picture} alt="" />
        </div>
        <div className={css.title}>داشبورد</div>
      </div>
      <ul className={css.sidebarLinks}>
        {
          navItem.map((item, index) => {
            if (item.onClick) {
              // اگر onClick داشتیم، تگ <a> رو تبدیل می‌کنیم به <button> تا رفتار کلیک داشته باشه
              return (
                <li key={index}>
                  <button onClick={item.onClick} className={css.logoutButton}>
                    <span>{item.title}</span>
                    <span>{item.icon}</span>
                  </button>
                </li>
              )
            } else {
              // بقیه موارد لینک عادی با <Link>
              return (
                <li key={index} className={isActive(`${item.link}`) ? css.active : ""}>
                  <Link to={item.link}>
                    <span>{item.title}</span>
                    <span>{item.icon}</span>
                  </Link>
                </li>
              )
            }
          })
        }
      </ul>
    </div>
  );
};

export default Sidebar;

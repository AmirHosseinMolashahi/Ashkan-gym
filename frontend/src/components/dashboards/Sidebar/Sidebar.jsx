import React from "react";
import css from "./Sidebar.module.scss";
import {
  UilHome,
  UilUser,
  UilSignOutAlt,
  UilCalendar,
  UilBell,
  UilMegaphone,
  UilCreditCard,
} from "@iconscout/react-unicons";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useLoading } from "../../../context/LoadingContext";
import { useToast } from "../../../context/NotificationContext";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../../store/userSlice";

const Sidebar = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notify } = useToast();
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    showLoading();
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/registration/login");
      notify("با موفقیت خارج شدید!", "info");
    } finally {
      hideLoading();
    }
  };

  const navItem = [
    { title: "داشبورد", icon: <UilHome />, link: "/dashboard" },
    { title: "اعلان ها", icon: <UilBell />, link: "/dashboard/notifications" },
    { title: "تقویم", icon: <UilCalendar />, link: "/dashboard/schedule" },
    { title: "اطلاعیه ها", icon: <UilMegaphone />, link: "/dashboard/announcements" },
    //{ title: "شهریه ها", icon: <UilCreditCard />, link: "/dashboard/payment" },
    { title: "پروفایل", icon: <UilUser />, link: "/dashboard/profile" },
    { title: "خروج", icon: <UilSignOutAlt />, onClick: handleLogout },
  ];

  if (loading) return <p>در حال بارگذاری...</p>;

  return (
    <div className={css.sidebar}>
      <div className={css.logo}>
        <div>
          <img src={user?.profile_picture} alt="" />
        </div>
        <div className={css.title}>{user?.role}</div>
      </div>
      <ul className={css.sidebarLinks}>
        {navItem.map((item, index) => {
          if (item.onClick) {
            return (
              <li key={index}>
                <button onClick={item.onClick} className={css.logoutButton}>
                  <span>{item.title}</span>
                  <span>{item.icon}</span>
                </button>
              </li>
            );
          }

          return (
            <li key={index} className={isActive(item.link) ? css.active : ""}>
              <Link to={item.link}>
                <span>{item.title}</span>
                <span>{item.icon}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;

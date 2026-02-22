import { Link, useLocation } from "react-router-dom";
import style from "./BreadCrumbs.module.scss";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNameMap = {
    dashboard: "داشبورد",
    profile: "پروفایل",
    schedule: "برنامه زمانی",
    announcements: "اطلاعیه ها",
    create: "ایجاد",
    edit: "ویرایش",
    notifications: "اعلان ها",
    "student-register": "ثبت نام دانش آموزان",
    courses: "کلاس ها",
    detail: "جزئیات",
    "my-courses": "کلاس های من",
    payment: "شهریه ها",
  };

  return (
    <nav className={style.breadcrumbContainer}>
      <ul style={{ display: "flex", listStyle: "none", gap: "8px", margin: 0, padding: 0 }}>
        <li>
          <Link to="/">خانه</Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const displayName = breadcrumbNameMap[value] || value;

          return last ? (
            <li key={to} style={{ color: "gray" }}>
              {" / "} {displayName}
            </li>
          ) : (
            <li key={to}>
              {" / "} <Link to={to}>{displayName}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;

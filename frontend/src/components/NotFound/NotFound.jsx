import React from "react";
import styles from "./NotFound.module.scss";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <div className={styles.iconWrapper}>
          <div className={styles.icon}>?</div>
        </div>

        <p className={styles.errorCode}>404 ارور</p>

        <h1 className={styles.title}>صفحه مورد نظر یافت نشد</h1>

        <p className={styles.description}>
          صحفه‌ای که به دنبال آن هستید ممکن است حذف شده باشد یا آدرس آن تغییر کرده باشد. لطفاً آدرس را بررسی کنید یا به داشبورد بازگردید.
        </p>

        <div className={styles.actions}>
           <button className={styles.secondaryBtn}>
            تماس با پشتیبانی
          </button>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate("/")}
          >
            بازگشت به خانه ←
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
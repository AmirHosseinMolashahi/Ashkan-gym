import React from "react";
import styles from "./Unauthorized.module.scss";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <div className={styles.iconWrapper}>
          <div className={styles.icon}>?</div>
        </div>

        <p className={styles.errorCode}>ارور 403</p>

        <h1 className={styles.title}>دسترسی محدود</h1>

        <p className={styles.description}>
          شما اجازه دسترسی به این صفحه را ندارید. لطفاً به صفحه اصلی بازگردید.
        </p>

        <div className={styles.actions}>
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

export default Unauthorized;
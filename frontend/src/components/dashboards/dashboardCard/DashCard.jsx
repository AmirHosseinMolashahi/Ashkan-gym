import styles from "./DashCard.module.scss";

const DashCard = ({ title, description, buttonText, onClick, icon, iconColor }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon} style={{background: iconColor}}>
          {icon}
        </div>
        {/* <span className={styles.menu}>⋯</span> */}
      </div>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      <button className={styles.mainButton} onClick={onClick}>
        {buttonText}
      </button>
    </div>
  );
};

export default DashCard;

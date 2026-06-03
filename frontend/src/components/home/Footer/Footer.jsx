import React from "react";
import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.col}>
        <h3>IRONCORE</h3>
        <p>Elite coaching and premium fitness experience.</p>
      </div>

      <div className={styles.col}>
        <h4 className={styles.colTitle}>Programs</h4>
        <ul className={styles.colList}>
          <li>Strength Training</li>
          <li>HIIT Classes</li>
          <li>Personal Coaching</li>
          <li>Yoga & Recovery</li>
        </ul>
      </div>

      <div className={styles.col}>
        <h4 className={styles.colTitle}>Company</h4>
        <ul className={styles.colList}>
          <li>About Us</li>
          <li>Careers</li>
          <li>Press</li>
          <li>Contact</li>
        </ul>
      </div>

      <div className={styles.col}>
        <h4>Stay Updated</h4>
        <input className={styles.contactEmail} placeholder="Enter your email" />
      </div>
    </footer>
  );
};

export default Footer;
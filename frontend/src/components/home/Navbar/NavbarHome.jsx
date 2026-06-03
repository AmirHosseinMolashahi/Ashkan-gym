import React, {useState, useEffect, forwardRef} from "react";
import styles from "./NavbarHome.module.scss";
import { useNavigate} from 'react-router-dom';
import { UilEstate, UilDumbbell, UilUsersAlt, UilExclamation, UilSignin  } from '@iconscout/react-unicons'

const NavbarHome = forwardRef(
  ({navbarToggle, setNavbarToggle}, ref) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 80); // threshold
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navigate = useNavigate()

    return (
      <nav ref={ref} className={`${styles.navbar} ${scrolled ? styles.scrolled : ""} ${navbarToggle === true ? styles.active : ''}`}>
        <div className={styles.container}>
          <ul className={styles.links}>
            <li onClick={() => navigate('/')}>
              <UilEstate />
              خانه
            </li>
            <li>
              <UilDumbbell />
              کلاس ها
            </li>
            <li>
              <UilUsersAlt />
              مربیان
            </li>
            <li>
              <UilExclamation />
              درباره‌ی ما
            </li>
          </ul>

          <div className={styles.actions}>
            <button className={styles.signIn} onClick={() => navigate('/registration/login')}>ورود به پنل کاربری</button>
            <button className={styles.join}>به ما ملحق شو</button>
          </div>
        </div>
      </nav>
    );
  }
);

export default NavbarHome;
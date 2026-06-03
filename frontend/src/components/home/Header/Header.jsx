import React, {useState, useRef, useEffect} from 'react'
import styles from './Header.module.scss';
import NavbarHome from '../Navbar/NavbarHome';
import AshkanLogo from '../../../assets/home/AshkanLogo.png';
import { UilBars } from '@iconscout/react-unicons'

const Header = ({navbarToggle, setNavbarToggle}) => {
  const navbarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target)
      ) {
        setNavbarToggle(false);
      }
    }

    if (navbarToggle) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navbarToggle]);
  return (
    <div className={styles.Header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src={AshkanLogo} alt="" />
        </div>
        <button className={styles.bars} onClick={() => setNavbarToggle(true)}>
          <UilBars />
        </button>
        <NavbarHome ref={navbarRef} navbarToggle={navbarToggle} setNavbarToggle={setNavbarToggle}/>
      </div>
    </div>
  )
}

export default Header;
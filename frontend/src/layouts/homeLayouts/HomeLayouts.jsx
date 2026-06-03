import React, {useState, useRef, useEffect} from 'react'
import { Outlet } from 'react-router-dom'
import style from './HomeLayouts.module.scss';
import Footer from '../../components/home/Footer/Footer';
import Header from '../../components/home/Header/Header';
import { useLocation } from 'react-router-dom';

const HomeLayouts = () => {
  const [navbarToggle, setNavbarToggle] = useState(false)

  const location = useLocation();

  useEffect(() => {
    setNavbarToggle(false);
  }, [location.pathname]);

  return (
    <div className={style.home}>
      <Header navbarToggle={navbarToggle} setNavbarToggle={setNavbarToggle}/>
      {navbarToggle && (
        <div
          className={style.overlay}
          onClick={() => setSidebarToggle(false)}
        />
      )}
      <div className={style.content}>
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default HomeLayouts
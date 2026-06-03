import React, {useState, useRef, useEffect} from "react";
import styles from "./Hero.module.scss";
import { UilPlayCircle } from '@iconscout/react-unicons'
import { motion, AnimatePresence } from "framer-motion";
import bb1 from '../../../assets/home/hero/bb1.jpg';
import bb2 from '../../../assets/home/hero/bb2.jpg';
import bbBg2 from '../../../assets/home/hero/bbBg2.jpg';
import pk1 from '../../../assets/home/hero/pk1.jpg';
import pk2 from '../../../assets/home/hero/pk2.jpg';
import pkBg from '../../../assets/home/hero/pkBg.jpg';
import wu2 from '../../../assets/home/hero/wu2.jpg';
import wu3 from '../../../assets/home/hero/wu3.jpg';
import wuBg from '../../../assets/home/hero/wuBg.jpg';


const Hero = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef(null);
  const slides = [
    {
      id: 1,
      title: "تبدیل به یک جنگجوی واقعی شو",
      subtitle: "در کلاس های ووشو (تالو و ساندا)",
      BgImage: wuBg,
      image1: wu2,
      image2: wu3,

    },
    {
      id: 2,
      title: "تبدیل به بهترین ورژن خودت شو",
      subtitle: "در کلاس های آمادگی جسمانی و بدنسازی",
      BgImage: bbBg2,
      image1: bb1,
      image2: bb2,

    },
    {
      id: 3,
      title: "آزادی و رهایی رو احساس کن",
      subtitle: "در کلاس های پارکور و تریکینگ",
      BgImage: pkBg,
      image1: pk1,
      image2: pk2,

    },
  ];

  const nextSlide = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // autoplay
  useEffect(() => {
    startAutoPlay();
    return () => clearInterval(intervalRef.current);
  }, []);

  const startAutoPlay = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, 5000);
  };

  const pauseAutoPlay = () => {
    clearInterval(intervalRef.current);
  };

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  const current = slides[index];

  return (
    <div className={styles.hero}>
      <div className={styles.wrapper}>

        {/* slides */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            className={styles.heroSlide}
            variants={variants}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.x < -50) nextSlide();
              if (info.offset.x > 50) prevSlide();
            }}
          >
            <img className={styles.heroImg} src={current.BgImage} alt="" />
            <div className={styles.overlay} />

            <div className={styles.heroContent}>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {current.title}
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {current.subtitle}
              </motion.p>

              <motion.div
                className={styles.btnContainer}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button>
                  پیش نمایش <UilPlayCircle />
                </button>

                <button>
                  ثبت نام در کلاس
                </button>
              </motion.div>
            </div>

            <motion.div className={`${styles.floatingImg} ${styles.Img1}`}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              >
              <img
                src={current.image1}
              />
            </motion.div>

            {/* تصویر کوچیک 2 */}
            <motion.div className={`${styles.floatingImg} ${styles.Img2}`}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              >
              <img src={current.image2}/>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* dots */}
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <span
              key={i}
              className={i === index ? "active" : ""}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
            />
          ))}
        </div>
        {/* progress bar */}
        <div className={styles.progress}>
          <motion.div
            key={index}
            className={styles.progressBar}
            initial={{ width: 0 , opacity: 1}}
            animate={{ width: "100%", opacity: 0 }}
            transition={{ duration: 5, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
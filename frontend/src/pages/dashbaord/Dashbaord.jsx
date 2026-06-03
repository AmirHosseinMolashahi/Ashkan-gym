import React from 'react'
import style from './Dashboard.module.scss';
import InfoBox from '../../components/dashboards/InfoBox/InfoBox'
import DetailBox from '../../components/dashboards/InfoBox/detailBox/DetailBox';
import { useNavigate } from 'react-router-dom';
import DashCard from '../../components/dashboards/dashboardCard/DashCard';
import { UilUserPlus, UilChatBubbleUser, UilCreditCard, UilUsersAlt  } from '@iconscout/react-unicons'
import RoleGuard from '../../wrapper/roleGuard';
import { useSelector } from 'react-redux';
import { motion } from "framer-motion";


const Dashbaord = () => {
  const navigate = useNavigate()
  const { user } = useSelector(
    state => state.auth
  )
  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 120,
      },
    }),
  };
  return (
    <div className={style.dashboard}>
      <div className={style.userInfo}>
        <div className={style.right}>
          <motion.div
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <InfoBox />
          </motion.div>
        </div>
        <div className={style.left}>
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <DetailBox />
          </motion.div>
        </div>
      </div>
      <div className={style.userContent}>
        {/* <button onClick={() => navigate('/dashboard/student-register')}>ثبت نام ورزشکار جدید +</button> */}
        <RoleGuard user={user} allowedRoles={['manager', 'coach']}>  
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
          <DashCard 
            title='ثبت نام ورزشکار جدید'
            description='اطلاعات اولیه، بارگزاری مدارک، اضافه به کلاس'
            buttonText='شروع ثبت نام'
            iconColor='#e9f0ff'
            icon={<UilUserPlus fill='#2f6bff' />}
            onClick={() => navigate('/dashboard/student-register')}
          />
        </motion.div>
          
        </RoleGuard>
        <RoleGuard user={user} allowedRoles={['manager', 'coach']}>  
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
          <DashCard 
            title='مدیریت کلاس ها'
            description='نمایش کلاس ها  و ورزشکاران'
            buttonText='ورود'
            iconColor='#e9ffeb'
            icon={<UilChatBubbleUser fill='#39ff2f' />}
            onClick={() => navigate('/dashboard/courses')}
          />
          </motion.div>
        </RoleGuard>
        <RoleGuard user={user} allowedRoles={['manager', 'coach']}>  
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
          <DashCard 
            title='مدیریت شهریه ها'
            description='نمایش وضعیت پرداخت ها'
            buttonText='ورود'
            iconColor='#ffe9e9'
            icon={<UilCreditCard fill='#ff2f2f' />}
            onClick={() => navigate('/dashboard/payment')}
          />
          </motion.div>
        </RoleGuard>
        <RoleGuard user={user} allowedRoles={['athlete']}>
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
          <DashCard 
            title='کلاس های من'
            description='نمایش کلاس ها و وضعیت من'
            buttonText='ورود'
            iconColor='#ffeee9ff'
            icon={<UilChatBubbleUser fill='#ff632f' />}
            onClick={() => navigate('/dashboard/my-courses')}
          />
          </motion.div>
        </RoleGuard>
        <RoleGuard user={user} allowedRoles={['athlete']}>  
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
          <DashCard 
            title='وضعیت شهریه ها'
            description='نمایش وضعیت پرداخت ها'
            buttonText='ورود'
            iconColor='#ffe9e9'
            icon={<UilCreditCard fill='#ff2f2f' />}
            onClick={() => navigate('/dashboard/student-payment')}
            />
          </motion.div>
        </RoleGuard>
        <RoleGuard user={user} allowedRoles={['manager', 'coach']}>  
          <motion.div
            custom={4}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
          <DashCard 
            title='مدیریت کاربران'
            description='نمایش کاربر ها و فعالیت های اخیر'
            buttonText='ورود'
            iconColor='#ffe9fc'
            icon={<UilUsersAlt  fill='#ff2fe7' />}
            onClick={() => navigate('/dashboard/user-management')}
          />
          </motion.div>
        </RoleGuard>
        {/* <DashCard />
        <DashCard /> */}
      </div>
    </div>
  )
}

export default Dashbaord;
import React from 'react'
import style from './Dashboard.module.scss';
import InfoBox from '../../components/dashboards/InfoBox/InfoBox'
import DetailBox from '../../components/dashboards/InfoBox/detailBox/DetailBox';
import { useNavigate } from 'react-router-dom';
import DashCard from '../../components/dashboards/dashboardCard/DashCard';
import { UilUserPlus, UilChatBubbleUser, UilCreditCard, UilUsersAlt  } from '@iconscout/react-unicons'
import RoleGuard from '../../wrapper/roleGuard';
import { useSelector } from 'react-redux';


const Dashbaord = () => {
  const navigate = useNavigate()
  const { user } = useSelector(
    state => state.auth
  )
  return (
    <div className={style.dashboard}>
      <div className={style.userInfo}>
        <div className={style.right}>
          <InfoBox />
        </div>
        <div className={style.left}>
          <DetailBox />
        </div>
      </div>
      <div className={style.userContent}>
        {/* <button onClick={() => navigate('/dashboard/student-register')}>ثبت نام ورزشکار جدید +</button> */}
        <RoleGuard user={user} allowedRoles={['manager', 'coach']}>  
          <DashCard 
            title='ثبت نام ورزشکار جدید'
            description='اطلاعات اولیه، بارگزاری مدارک، اضافه به کلاس'
            buttonText='شروع ثبت نام'
            iconColor='#e9f0ff'
            icon={<UilUserPlus fill='#2f6bff' />}
            onClick={() => navigate('/dashboard/student-register')}
          />
        </RoleGuard>
        <RoleGuard user={user} allowedRoles={['manager', 'coach']}>  
          <DashCard 
            title='مدیریت کلاس ها'
            description='نمایش کلاس ها  و ورزشکاران'
            buttonText='ورود'
            iconColor='#e9ffeb'
            icon={<UilChatBubbleUser fill='#39ff2f' />}
            onClick={() => navigate('/dashboard/courses')}
          />
        </RoleGuard>
        <RoleGuard user={user} allowedRoles={['manager', 'coach']}>  
          <DashCard 
            title='مدیریت شهریه ها'
            description='نمایش وضعیت پرداخت ها'
            buttonText='ورود'
            iconColor='#ffe9e9'
            icon={<UilCreditCard fill='#ff2f2f' />}
            onClick={() => navigate('/dashboard/payment')}
          />
        </RoleGuard>
        <RoleGuard user={user} allowedRoles={['athlete']}>
          <DashCard 
            title='کلاس های من'
            description='نمایش کلاس ها و وضعیت من'
            buttonText='ورود'
            iconColor='#ffeee9ff'
            icon={<UilChatBubbleUser fill='#ff632f' />}
            onClick={() => navigate('/dashboard/my-courses')}
          />
        </RoleGuard>
        <RoleGuard user={user} allowedRoles={['athlete']}>  
          <DashCard 
            title='وضعیت شهریه ها'
            description='نمایش وضعیت پرداخت ها'
            buttonText='ورود'
            iconColor='#ffe9e9'
            icon={<UilCreditCard fill='#ff2f2f' />}
            onClick={() => navigate('/dashboard/student-payment')}
          />
        </RoleGuard>
        <RoleGuard user={user} allowedRoles={['manager']}>  
          <DashCard 
            title='مدیریت کاربران'
            description='نمایش کاربر ها و فعالیت های اخیر'
            buttonText='ورود'
            iconColor='#ffe9fc'
            icon={<UilUsersAlt  fill='#ff2fe7' />}
            onClick={() => navigate('/dashboard/user-management')}
          />
        </RoleGuard>
        {/* <DashCard />
        <DashCard /> */}
      </div>
    </div>
  )
}

export default Dashbaord
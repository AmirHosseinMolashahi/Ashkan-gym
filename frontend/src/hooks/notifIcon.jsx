import { UilMegaphone, UilCalendar, UilUsdCircle, UilSignin, UilLaptop } from '@iconscout/react-unicons'

const NotifCategory = {
  announcements : <UilMegaphone fill='#3b82f6' />,
  reminders : <UilCalendar fill='#2ECC71'/>,
  tuition: <UilUsdCircle fill='#C1121F'/>,
  courses: <UilLaptop fill='#F1C40F' />,
  registration: <UilSignin fill='#c80ff1ff'/>,
}

const NotifIcon = (cat) => {
   return NotifCategory[cat] || cat;
}

export default NotifIcon;
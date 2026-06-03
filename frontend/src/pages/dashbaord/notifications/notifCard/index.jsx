import { useIsMobile } from './notifCard.utils'
import NotifCardMobile from './NotifCard.mobile'
import NotifCardDesktop from './NotifCard.desktop'

const NotifCard = (props) => {
  const isMobile = useIsMobile();
  return isMobile ? <NotifCardMobile {...props} /> : <NotifCardDesktop {...props} />
}

export default NotifCard;
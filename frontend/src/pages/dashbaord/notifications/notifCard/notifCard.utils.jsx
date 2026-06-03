import { useState, useEffect } from 'react';
import { parseISO, formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import {
  UilMegaphone,
  UilCalendar,
  UilUsdCircle,
  UilSignin,
  UilLaptop,
} from '@iconscout/react-unicons';

export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoint
  );

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
};

export function timeAgo(dateString) {
  return formatDistanceToNow(parseISO(dateString), {
    addSuffix: true,
    locale: faIR,
  });
}

export const NotifCategory = {
  announcements: <UilMegaphone />,
  reminders: <UilCalendar />,
  tuition: <UilUsdCircle />,
  courses: <UilLaptop />,
  registration: <UilSignin />,
};
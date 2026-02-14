import { useEffect, useState } from 'react';

const useCurrentDateTime = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return {
    date: now.toLocaleDateString('fa-IR'),
    time: now.toLocaleTimeString('fa-IR'),
    weekday: now.toLocaleDateString('fa-IR', {weekday: 'long',}),
    month: now.toLocaleDateString('fa-IR', {month: 'long',})
  };
};

export default useCurrentDateTime;
import React from 'react'
import { AuthProvider } from '../context/AuthContext'
import { NotificationProvider } from '../context/notificationContext';
import { LoadingProvider } from '../context/LoadingContext';
import GlobalLoader from '../components/GlobalComponents/Loader/GlobalLoader';

const Providers = ({children}) => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <LoadingProvider>
          <GlobalLoader />
          {children}
        </LoadingProvider>
      </AuthProvider>
    </NotificationProvider>
  )
}

export default Providers
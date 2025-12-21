import React from 'react'
import { ToastProvider } from '../context/NotificationContext'
import { LoadingProvider } from '../context/LoadingContext';
import GlobalLoader from '../components/GlobalComponents/Loader/GlobalLoader';
import { Provider } from 'react-redux'
import { store } from '../store';

const Providers = ({children}) => {
  return (
    <Provider store={store}>
        <ToastProvider>
          <LoadingProvider>
            <GlobalLoader />
            {children}
          </LoadingProvider>
        </ToastProvider>
    </Provider>
  )
}

export default Providers
import React from 'react'
import { ToastProvider } from '../context/NotificationContext'
import { LoadingProvider } from '../context/LoadingContext';
import GlobalLoader from '../components/GlobalComponents/Loader/GlobalLoader';
import { Provider } from 'react-redux'
import { store } from '../store';
import NewtonLoader from '../components/GlobalComponents/NewtonLoader/NewtonLoader';
import { BrowserRouter } from "react-router-dom";

const Providers = ({children}) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastProvider>
          <LoadingProvider>
            <GlobalLoader />
            {children}
          </LoadingProvider>
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  )
}

export default Providers
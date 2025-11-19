import React, {createContext, useContext, useState} from 'react'

const LoadingContext = createContext();

export const LoadingProvider = ({children}) => {
  
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoading = () => setLoadingCount((c) => c + 1);
  const hideLoading = () => setLoadingCount((c) => Math.max(0, c-1));

  return (
    <LoadingContext.Provider value={{showLoading, hideLoading, isLoading: loadingCount > 0}}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
export const saveRegisterProgress = (data) => {
  localStorage.setItem("registerProgress", JSON.stringify(data));
};

export const getRegisterProgress = () => {
  const data = localStorage.getItem("registerProgress");
  return data ? JSON.parse(data) : null;
};

export const clearRegisterProgress = () => {
  localStorage.removeItem("registerProgress");
};

export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const setUserData = (userData) => {
  localStorage.setItem('userData', JSON.stringify(userData));
};

export const clearAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
};

export const isAuthenticated = () => {
  return !!getAccessToken();
};

export const getUserRole = () => {
  const userData = getUserData();
  return userData ? userData.role : null;
};

export const checkTokenStatus = () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const userData = getUserData();
  
  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasUserData: !!userData,
    tokenDetails: accessToken ? {
      accessToken: accessToken.substring(0, 20) + '...',  // Chỉ hiện một phần token
      userRole: userData?.role
    } : null
  };
};

export const ROLE_PERMISSIONS = {
  admin: [
    '/products',
    '/list-import-product', 
    '/services',
    '/warehouse',
    '/orders',
    '/list-customer',
    '/list-employee',
    '/revenue',
    '/unit-type'
  ],
  seller: [
    '/orders',
    '/list-import-product',
    '/services', 
    '/list-customer'
  ],
  warehouse: [
    '/products',
    '/warehouse',
    '/unit-type'
  ]
};

export const hasRouteAccess = (path) => {
  const userRole = getUserRole()?.toLowerCase();
  if (!userRole) return false;
  
  // Admin has access to everything
  if (userRole === 'admin') return true;
  
  return ROLE_PERMISSIONS[userRole]?.includes(path);
};

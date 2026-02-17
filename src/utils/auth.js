export const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const getAccessToken = () => localStorage.getItem("accessToken");

export const isAuthenticated = () => {
  const token = getAccessToken();
  const user = getStoredUser();
  return !!(token && user);
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const hasRole = (requiredRoles) => {
  const user = getStoredUser();
  if (!user || !user.role) return false;

  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }

  return user.role === requiredRoles;
};

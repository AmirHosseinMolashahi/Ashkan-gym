const RoleGuard = ({ user, allowedRoles, children }) => {
  if (!user) return null;

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
};

export default RoleGuard;

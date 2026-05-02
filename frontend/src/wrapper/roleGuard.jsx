import React from 'react';

const RoleGuard = ({ user, allowedRoles, children }) => {
  
  if (!user) return null;

  // roles می‌تواند آرایه یا رشته باشد
  const userRoles = user.roles;
  
  let hasRole = false;
  
  if (Array.isArray(userRoles)) {
    // آرایه از آبجکت‌ها: [{name: "coach"}, {name: "manager"}]
    if (userRoles.length > 0 && typeof userRoles[0] === 'object' && 'name' in userRoles[0]) {
      hasRole = userRoles.some(r => allowedRoles.includes(r.name));
    } else {
      // آرایه از رشته‌ها: ["coach", "manager"]
      hasRole = userRoles.some(r => allowedRoles.includes(r));
    }
  } else if (typeof userRoles === 'string') {
    // رشته ساده (برای سازگاری با کد قدیمی)
    hasRole = allowedRoles.includes(userRoles);
  }

  if (!hasRole) {
    return null;
  }

  return children;
};

export default RoleGuard;

const roleTitles = {
    manager: "مدیر",
    coach: "مربی",
    athlete: "ورزشکار"
  };

const roleConverter = (role) => {
    if (!role) return "";
    
    // اگر آرایه باشد (roles جدید)
    if (Array.isArray(role)) {
        if (role.length === 0) return "";
        // اگر آرایه از آبجکت‌های Role باشد
        if (typeof role[0] === 'object' && role[0] !== null && 'name' in role[0]) {
            return role.map(r => roleTitles[r.name] || r.name).join("، ");
        }
        // اگر آرایه از نام‌ها باشد
        return role.map(r => roleTitles[r] || r).join("، ");
    }
    
    // اگر آبجکت باشد (مثلاً {name: "coach"})
    if (typeof role === 'object' && role !== null && 'name' in role) {
        return roleTitles[role.name] || role.name;
    }
    
    // رشته ساده (برای سازگاری با کد قدیمی)
    return roleTitles[role] || role;
}

// تابع کمکی برای بررسی اینکه آیا کاربر نقش خاصی دارد
const hasRole = (userRoles, targetRoles) => {
    if (!userRoles) return false;
    
    const roles = Array.isArray(targetRoles) ? targetRoles : [targetRoles];

    if (Array.isArray(userRoles)) {
        if (userRoles.length > 0 && typeof userRoles[0] === 'object' && 'name' in userRoles[0]) {
            return userRoles.some(r => roles.includes(r.name));
        }
        return userRoles.some(r => roles.includes(r));
    }

    if (typeof userRoles === 'object' && 'name' in userRoles) {
        return roles.includes(userRoles.name);
    }

    return roles.includes(userRoles);
}

export { roleConverter, hasRole };
export default roleConverter;
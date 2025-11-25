const roleTitles = {
    manager: "مدیر",
    coach: "مربی",
    athlete: "ورزشکار"
  };

const roleConverter = (role) => {
    return roleTitles[role];
}

export default roleConverter
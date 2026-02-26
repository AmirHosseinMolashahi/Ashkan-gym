from django.db import models


class ActionType(models.TextChoices):
    ATHLETE_LOGIN = "athlete_login", "ورزشکار: ورود به سیستم"
    ATHLETE_UPDATE_PROFILE = "athlete_update_profile", "ورزشکار: بروزرسانی پروفایل"
    ATHLETE_CHANGE_PASSWORD = "athlete_change_password", "ورزشکار: تغییر رمز عبور"
    ATHLETE_PAY_TUITION = "athlete_pay_tuition", "ورزشکار: پرداخت شهریه"

    COACH_LOGIN = "coach_login", "مربی: ورود به سیستم"
    COACH_CHANGE_PASSWORD = "coach_change_password", "مربی: تغییر رمز عبور"
    COACH_UPDATE_PROFILE = "coach_update_profile", "مربی: بروزرسانی پروفایل"
    COACH_RECORD_TUITION = "coach_record_tuition", "مربی: ثبت شهریه"
    COACH_RECORD_ATTENDANCE = "coach_record_attendance", "مربی: ثبت حضور و غیاب"
    COACH_REGISTER_ATHLETE = "coach_register_athlete", "مربی: ثبت نام ورزشکار جدید"
    COACH_ADD_ATHLETE_TO_CLASS = "coach_add_athlete_to_class", "مربی: اضافه کردن ورزشکار جدید به کلاس"

    MANAGER_LOGIN = "manager_login", "مدیر: ورود به سیستم"
    MANAGER_CHANGE_PASSWORD = "manager_change_password", "مدیر: تغییر رمز عبور"
    MANAGER_UPDATE_PROFILE = "manager_update_profile", "مدیر: بروزرسانی پروفایل"
    MANAGER_RECORD_TUITION = "manager_record_tuition", "مدیر: ثبت شهریه"
    MANAGER_RECORD_ATTENDANCE = "manager_record_attendance", "مدیر: ثبت حضور و غیاب"
    MANAGER_REGISTER_ATHLETE = "manager_register_athlete", "مدیر: ثبت نام ورزشکار جدید"
    MANAGER_ADD_ATHLETE_TO_CLASS = "manager_add_athlete_to_class", "مدیر: اضافه کردن ورزشکار جدید به کلاس"
    MANAGER_EDIT_USER = "manager_edit_user", "مدیر: ویرایش کاربر"
    MANAGER_DELETE_USER = "manager_delete_user", "مدیر: حذف کاربر"


AUDIT_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

ROLE_ALIASES = {
    "manager": "manager",
    "coach": "coach",
    "athlete": "athlete",
}

# فقط همین rule ها لاگ می‌شوند.
AUDIT_RULES = [
    {
        "id": "login",
        "methods": {"POST"},
        "view_names": {"account:login", "login"},
        "path_keywords": {"/account/login/"},
        "actions_by_role": {
            "athlete": ActionType.ATHLETE_LOGIN,
            "coach": ActionType.COACH_LOGIN,
            "manager": ActionType.MANAGER_LOGIN,
        },
        "descriptions_by_role": {
            "athlete": "ورزشکار وارد سیستم شد",
            "coach": "مربی وارد سیستم شد",
            "manager": "مدیر وارد سیستم شد",
        },
    },
    # {
    #     "id": "change_password",
    #     "methods": {"PUT", "PATCH"},
    #     "view_names": {"account:update-user", "update-user"},
    #     "path_keywords": {"/account/update/"},
    #     "condition": "password_change",
    #     "actions_by_role": {
    #         "athlete": ActionType.ATHLETE_CHANGE_PASSWORD,
    #         "coach": ActionType.COACH_CHANGE_PASSWORD,
    #         "manager": ActionType.MANAGER_CHANGE_PASSWORD,
    #     },
    #     "descriptions_by_role": {
    #         "athlete": "ورزشکار رمز عبور را تغییر داد",
    #         "coach": "مربی رمز عبور را تغییر داد",
    #         "manager": "مدیر رمز عبور را تغییر داد",
    #     },
    # },
    {
        "id": "update_profile",
        "methods": {"PUT", "PATCH"},
        "view_names": {"account:update-user", "update-user"},
        "path_keywords": {"/account/update/"},
        "condition": "update_profile",
        "actions_by_role": {
            "athlete": ActionType.ATHLETE_UPDATE_PROFILE,
            "coach": ActionType.COACH_UPDATE_PROFILE,
            "manager": ActionType.MANAGER_UPDATE_PROFILE,
        },
        "descriptions_by_role": {
            "athlete": "ورزشکار پروفایل خود را بروزرسانی کرد",
            "coach": "مربی پروفایل خود را بروزرسانی کرد",
            "manager": "مدیر پروفایل خود را بروزرسانی کرد",
        },
    },
    {
        "id": "athlete_pay_tuition",
        "methods": {"POST", "PATCH", "PUT"},
        "view_names": {"athlete-payment-create", "payment-verify", "payment-callback"},
        "path_keywords": {"/payment/", "verify", "callback"},
        "actions_by_role": {
            "athlete": ActionType.ATHLETE_PAY_TUITION,
        },
        "descriptions_by_role": {
            "athlete": "ورزشکار شهریه را پرداخت کرد",
        },
    },
    {
        "id": "coach_record_tuition",
        "methods": {"PATCH", "PUT"},
        "view_names": {"coach-invoice-update"},
        "path_keywords": {"/payment/coach/invoices/"},
        "actions_by_role": {
            "coach": ActionType.COACH_RECORD_TUITION,
            "manager": ActionType.MANAGER_RECORD_TUITION,
        },
        "descriptions_by_role": {
            "coach": "مربی شهریه را ثبت/به‌روزرسانی کرد",
            "manager": "مدیر شهریه را ثبت/به‌روزرسانی کرد",
        },
    },
    {
        "id": "coach_record_attendance",
        "methods": {"PATCH", "PUT", "POST"},
        "view_names": {"training:session-bulk", "training:session-attendance", "session-bulk", "session-attendance"},
        "path_keywords": {"/training/session/", "/attendance/"},
        "actions_by_role": {
            "coach": ActionType.COACH_RECORD_ATTENDANCE,
            "manager": ActionType.MANAGER_RECORD_ATTENDANCE,
        },
        "descriptions_by_role": {
            "coach": "مربی حضور و غیاب ثبت کرد",
            "manager": "مدیر حضور و غیاب ثبت کرد",
        },
    },
    {
        "id": "coach_register_athlete",
        "methods": {"POST"},
        "view_names": {"account:register", "register"},
        "path_keywords": {"/account/register/"},
        "actions_by_role": {
            "coach": ActionType.COACH_REGISTER_ATHLETE,
            "manager": ActionType.MANAGER_REGISTER_ATHLETE,
        },
        "descriptions_by_role": {
            "coach": "مربی ورزشکار جدید ثبت نام کرد",
            "manager": "مدیر ورزشکار جدید ثبت نام کرد",
        },
    },
    {
        "id": "coach_add_athlete_to_class",
        "methods": {"POST"},
        "view_names": {"training:add-enrollment", "add-enrollment"},
        "path_keywords": {"/training/enrollment/add/"},
        "actions_by_role": {
            "coach": ActionType.COACH_ADD_ATHLETE_TO_CLASS,
            "manager": ActionType.MANAGER_ADD_ATHLETE_TO_CLASS,
        },
        "descriptions_by_role": {
            "coach": "مربی ورزشکار جدید را به کلاس اضافه کرد",
            "manager": "مدیر ورزشکار جدید را به کلاس اضافه کرد",
        },
    },
    {
        "id": "manager_edit_user",
        "methods": {"POST", "PATCH", "PUT"},
        "view_names": {"account:management-user-detail", "management-user-detail"},
        "path_keywords": {"/account/management-users/"},
        "actions_by_role": {
            "manager": ActionType.MANAGER_EDIT_USER,
        },
        "descriptions_by_role": {
            "manager": "مدیر اطلاعات ورزشکار را ویرایش کرد",
        },
    },
    {
        "id": "manager_delete_user",
        "methods": {"DELETE"},
        "view_names": {"account:management-user-delete", "management-user-delete"},
        "path_keywords": {"/account/management-users/"},
        "actions_by_role": {
            "manager": ActionType.MANAGER_DELETE_USER,
        },
        "descriptions_by_role": {
            "manager": "مدیر کاربر را حذف کرد",
        },
    },
]

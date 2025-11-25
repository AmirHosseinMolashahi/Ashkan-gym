from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser, LoginHistory


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    ordering = ['national_id']
    readonly_fields = ['previous_login']
    list_display = [
        "national_id",
        "full_name",
        "role",
        "is_staff",
        "is_active",
    ]
    def full_name(self, obj):
        return obj.get_full_name()

    full_name.short_description = "نام کامل"
    
    fieldsets = (
        (None, {"fields": ("national_id", "password")}),
        (_("Personal info"), {"fields": ("profile_picture","first_name", "last_name","father_name", "email", "phone_number", "birthdate", "address", "gender")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined", "previous_login")}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('national_id', 'password1', 'password2'),
        }),
    )


class LoginHistoryAdmin(admin.ModelAdmin):
    model = LoginHistory
    list_display = [
        "user",
        "login_time",
    ]

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(LoginHistory, LoginHistoryAdmin)
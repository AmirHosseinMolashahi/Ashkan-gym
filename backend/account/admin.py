from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser, Coach


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    ordering = ['national_id']
    list_display = [
        "email",
        "national_id",
        "is_staff",
        "is_active",
    ]
    fieldsets = (
        (None, {"fields": ("national_id", "password")}),
        (_("Personal info"), {"fields": ("profile_picture","first_name", "last_name","father_name", "email", "phone_number", "birthdate", "address", "gender")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_manager",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('national_id', 'password1', 'password2'),
        }),
    )

class CoachAdmin(admin.ModelAdmin):
    model = Coach
    list_display = [
        "user",
        "is_active",
    ]



admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Coach, CoachAdmin)
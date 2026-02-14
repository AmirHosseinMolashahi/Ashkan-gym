from django.contrib import admin
from .models import Registration, RegistrationDocument

# Register your models here.

class RegistrationAdmin(admin.ModelAdmin):
    model = Registration
    list_display = ['user', 'created_by','current_step','status']

admin.site.register(Registration, RegistrationAdmin)
admin.site.register(RegistrationDocument)
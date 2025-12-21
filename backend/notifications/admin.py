from django.contrib import admin
from .models import Notification
# Register your models here.

class NotificationsAdmin(admin.ModelAdmin):
    model = Notification
    list_display = ['title', 'user', 'type']

admin.site.register(Notification, NotificationsAdmin)
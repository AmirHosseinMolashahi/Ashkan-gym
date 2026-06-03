from django.contrib import admin
from .models import Reminder, ReminderCategory

# Register your models here.

class ReminderAdmin(admin.ModelAdmin):
    model = Reminder
    list_display = ['title', 'user', 'finished', 'priority','date', 'time']


admin.site.register(Reminder, ReminderAdmin)
admin.site.register(ReminderCategory)
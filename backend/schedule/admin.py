from django.contrib import admin
from .models import Schedule

# Register your models here.

class ScheduleAdmin(admin.ModelAdmin):
    model = Schedule
    list_display = ['title', 'user', 'finished', 'time']


admin.site.register(Schedule, ScheduleAdmin)
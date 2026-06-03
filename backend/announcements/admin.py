from django.contrib import admin
from .models import Announcement, AnnouncementRead

# Register your models here.

class AnnouncementAdmin(admin.ModelAdmin):
    model = Announcement
    list_display = [
        'title',
        'user',
        'created_at',
        'status',
        'is_global',
    ]

admin.site.register(Announcement, AnnouncementAdmin)
admin.site.register(AnnouncementRead)
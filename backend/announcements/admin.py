from django.contrib import admin
from .models import Announcements, AnnouncementRecipient

# Register your models here.

class AnnouncementsAdmin(admin.ModelAdmin):
    model = Announcements
    list_display = [
        'title',
        'user',
        'time',
        'status',
    ]

admin.site.register(Announcements, AnnouncementsAdmin)
admin.site.register(AnnouncementRecipient)
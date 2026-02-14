from django.db import models
from account.models import CustomUser

# Create your models here.
class Notification(models.Model):

    NOTIF_TYPES = (
        ("info", "Information"),
        ("success", "Success"),
        ("warning", "Warning"),
        ("error", "Error"),
        ("message", "Message"),
        ("order", "Order"),
    )
    NOTIF_CATS = (
        ("announcements", "Announcements"),
        ("reminders", "Reminders"),
        ("tuition", "Tuition"),
        ("courses", "Courses"),
        ("registration", "Registration"),
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=20, choices=NOTIF_TYPES, default="info")
    title = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=20, choices=NOTIF_CATS, null=True, blank=True)
    url = models.CharField(max_length=255, blank=True, null=True)  # لینک داخل سایت (اختیاری)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'اعلان'
        verbose_name_plural = 'اعلان ها'

    def __str__(self):
        return f"{self.user.username} - {self.message[:20]}"
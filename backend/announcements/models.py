from django.db import models
from account.models import CustomUser, Role
from training.models import Course

# Create your models here.
class Announcement(models.Model):
    STATUS_CHOICES = (
        ('p', 'Published'),
        ('b', 'Back'),
        ('d', 'Draft'),
        ('r', 'Review'),
    )

    TARGET_CHOICES = (
        ('all', 'همه'),
        ('role', 'نقش'),
        ('class', 'کلاس'),
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE,related_name='created_announcements', verbose_name="ایجاد کننده")
    title = models.CharField(max_length=256, verbose_name="عنوان")
    descriptions = models.TextField(verbose_name="توضیحات")
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, verbose_name="وضعیت", default='d')
    is_global = models.BooleanField(default=False)

    target_roles = models.ManyToManyField(
        Role,
        blank=True,
    )

    target_classes = models.ManyToManyField(
        Course,
        blank=True,
    )

    target_users = models.ManyToManyField(
        CustomUser,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="ایجاد شده در")

    def __str__(self):
        return f"{self.title} - {self.user.get_full_name()}"
    
    class Meta:
        verbose_name = 'اطلاعیه'
        verbose_name_plural = 'اطلاعیه ها'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
        ]



class AnnouncementRead(models.Model):

    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name='read_logs'
    )

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='read_announcements'
    )

    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('announcement', 'user')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['announcement']),
        ]
        verbose_name = 'رسید خوانده شدن اطلاعیه'
        verbose_name_plural = 'رسیدهای خوانده شدن اطلاعیه‌ها'
    
    def __str__(self):
        return f"{self.announcement.title} -- خوانده شده توسط: {self.user.get_full_name()}"
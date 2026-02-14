from django.db import models
from account.models import CustomUser

# Create your models here.

class AnnouncementRecipient(models.Model):
    announcement = models.ForeignKey('Announcements', on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    is_read = models.BooleanField(default=False)

    class Meta:
        unique_together = ('announcement', 'user')
        verbose_name = 'دریافت کننده اطلاعیه'
        verbose_name_plural = 'دریافت کننده های اطلاعیه ها'
    
    def __str__(self):
        return self.announcement.title + '-- به: ' + self.user.get_full_name()

class Announcements(models.Model):
    STATUS_CHOICES = (
        ('p', 'Published'),
        ('b', 'Back'),
        ('d', 'Draft'),
        ('r', 'Review'),
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE,related_name='created_announcements', verbose_name="ایجاد کننده")
    title = models.CharField(max_length=256, verbose_name="عنوان")
    descriptions = models.TextField(verbose_name="توضیحات")
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, verbose_name="وضعیت", default='d')
    time = models.DateTimeField(verbose_name="زمان")
    recipients = models.ManyToManyField(
        CustomUser,
        related_name='received_announcements',
        through='AnnouncementRecipient'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="ایجاد شده در")

    def __str__(self):
        return self.title + " " + self.user.get_full_name()
    
    class Meta:
        verbose_name = 'اطلاعیه'
        verbose_name_plural = 'اطلاعیه ها'

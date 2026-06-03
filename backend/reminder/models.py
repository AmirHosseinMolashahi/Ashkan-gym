from django.db import models
from account.models import CustomUser

# Create your models here.

class ReminderCategory(models.Model):
    name = models.CharField(max_length=20, verbose_name='عنوان')

    def __str__(self):
        return self.name



class Reminder(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name='کاربر')
    title = models.CharField(verbose_name='عنوان')
    descriptions = models.TextField(verbose_name='توضیحات')
    category = models.ForeignKey(ReminderCategory, on_delete=models.SET_NULL, null=True, verbose_name='دسته بندی')
    date = models.DateField(verbose_name='تاریخ')
    time = models.TimeField(verbose_name='ساعت')
    priority = models.BooleanField(default=False, verbose_name='اولویت')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='ایجاد شده در')
    finished = models.BooleanField(default=False, blank=True, verbose_name='پایان یافته')

    def __str__(self):
        return self.title + " " + self.user.get_full_name()
    
    class Meta:
        verbose_name = 'یادآور'
        verbose_name_plural = 'یادآور ها'
        ordering = ["finished", "date", "created_at"]
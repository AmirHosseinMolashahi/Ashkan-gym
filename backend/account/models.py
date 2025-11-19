from django.db import models
from django.contrib.auth.models import AbstractUser

import uuid
import os
from django.contrib.auth.base_user import BaseUserManager
from django.core.validators import RegexValidator

class CustomUserManager(BaseUserManager):
    def create_user(self, national_id, password=None, **extra_fields):
        if not national_id:
            raise ValueError('User must provide a national_id')
        
        user = self.model(national_id=national_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, national_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(national_id, password, **extra_fields)

def user_directory_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'  # تولید نام یکتا
    return f'user_{instance.id}/{filename}'

class CustomUser(AbstractUser):
    GENDER_CHOICES = (
        ('m', 'male'),
        ('f', 'female'),
    )
    username = None   # حذف username
    national_id = models.CharField(
        verbose_name='کد ملی',
        max_length=10,
        unique=True
    )

    phone_regex = RegexValidator(
        regex=r'^(\+98|0)?9\d{9}$',
        message="شماره موبایل معتبر نیست."
    )

    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=15,
        verbose_name="شماره موبایل"
    )
    birthdate = models.DateField(verbose_name='تاریخ تولد', null=True)
    address = models.TextField(verbose_name='آدرس',null=True)
    gender = models.CharField(verbose_name='جنسیت', max_length=1, choices=GENDER_CHOICES, null=True)
    father_name = models.CharField(verbose_name='نام پدر')
    is_manager = models.BooleanField(verbose_name='Manager', default=False, help_text='اگر فعال باشد، این کاربر به عنوان مدیر شناخته می‌شود و به بخش‌های مدیریتی دسترسی دارد.')
    profile_picture = models.ImageField(upload_to=user_directory_path, verbose_name='عکس پروفایل', default='default/man-user.jpg')

    USERNAME_FIELD = 'national_id'   # اینجا مهم‌ترین بخش است
    REQUIRED_FIELDS = []             # چون username حذف شده

    def __str__(self):
        return self.get_full_name()
    
    def gender_title(self):
        if self.gender == 'm':
            return "آقا"
        else:
            return "خانم"
    
    def get_full_name(self):
         return (self.first_name + ' ' + self.last_name)
    
    objects = CustomUserManager()
    
class Coach(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    is_active = models.BooleanField()
    account = models.IntegerField(default=0)

    def __str__(self):
        return (self.user.first_name + ' ' + self.user.last_name)
    
    class Meta:
        verbose_name = 'مربی'
        verbose_name_plural = 'مربیان'
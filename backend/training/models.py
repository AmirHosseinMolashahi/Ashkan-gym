from django.db import models
from account.models import CustomUser

# Create your models here.

class Course(models.Model):
    GENDER = (
        ('male', 'آقایان'),
        ('female', 'بانوان'),
        ('both', 'عمومی'),
    )
    title = models.CharField(max_length=256, verbose_name='عنوان کلاس')
    coach = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={"role" : "coach"},
        related_name="courses",
        verbose_name='مربی'
    )
    gender = models.CharField(max_length=10, choices=GENDER)
    price = models.PositiveIntegerField(verbose_name='قیمت')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    created_at = models.DateTimeField(auto_now_add=True)


class Enrollment(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('deactive', 'Deactive'),
    )

    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'athlete'},
        related_name='enrollments',
        verbose_name='ورزشکار',
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name='کلاس',
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name='وضعیت ورزشکار',
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')


class Schedule(models.Model):
    DAYS = (
        (1, 'شنبه'),
        (2, 'یکشنبه'),
        (3, 'دوشنبه'),
        (4, 'سه‌شنبه'),
        (5, 'چهارشنبه'),
        (6, 'پنجشنبه'),
        (7, 'جمعه'),
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    day_of_week = models.PositiveSmallIntegerField(
        choices=DAYS,
        verbose_name='روز هفته'
    )
    start_time = models.TimeField(verbose_name='ساعت شروع')
    end_time = models.TimeField(verbose_name='ساعت پایان')


class Session(models.Model):
    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    date = models.DateField(verbose_name='تاریخ جلسه')


class Attendance(models.Model):
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    )

    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'athlete'},
        related_name='attendances'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES
    )

    class Meta:
        unique_together = ('session', 'student')
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['session']),
        ]

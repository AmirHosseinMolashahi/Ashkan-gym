from django.db import models
from account.models import CustomUser

# Create your models here.
class AgeRange(models.Model):
    key = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=50)

    def __str__(self):
        return self.title

class Course(models.Model):
    GENDER = (
        ('male', 'آقایان'),
        ('female', 'بانوان'),
        ('both', 'عمومی'),
    )

    CLASS_STATUS = (
        ('public', 'عمومی'),
        ('private', 'خصوصی'),
    )

    title = models.CharField(max_length=256, verbose_name='عنوان کلاس')
    avatar = models.ImageField(upload_to='courses/', null=True, default='default/dumble.jpg')
    coach = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={"role" : "coach"},
        related_name="courses",
        verbose_name='مربی'
    )
    gender = models.CharField(max_length=10, choices=GENDER, verbose_name='جنسیت')
    price = models.PositiveIntegerField(verbose_name='قیمت')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    created_at = models.DateTimeField(auto_now_add=True)
    age_ranges = models.ManyToManyField(
        AgeRange,
        related_name="courses",
        verbose_name="رده‌های سنی"
    )
    class_status = models.CharField(max_length=10, choices=CLASS_STATUS, verbose_name='نوع کلاس')

    def __str__(self):
            age_ranges = ", ".join([str(age) for age in self.age_ranges.all()])
            return self.title + ' رده سنی ' + age_ranges + ' مربی: ' + self.coach.first_name + ' ' + self.coach.last_name
    
    class Meta:
        verbose_name = 'کلاس'
        verbose_name_plural = 'کلاس ها'


class Enrollment(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('deactive', 'Deactive'),
    )

    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={'roles__name': 'athlete'},
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
    
    start_date = models.DateField() #تاریخ فعال شدن
    
    end_date = models.DateField(null=True, blank=True) # تاریخ غیر فعال شدن
    
    custom_due_day = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="مثلاً 7 یعنی هفتم هر ماه",
        default=1
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'course'],
                name='unique_student_course'
            )
        ]
        verbose_name = 'ثبت نام'
        verbose_name_plural = 'ثبت نام ها'

    def __str__(self):
        return self.student.first_name + " در " + self.course.title
    
    def get_final_fee(self):
        base = self.course.price

        pricing = getattr(self, 'pricing', None)

        if not pricing:
            return base

        if pricing.monthly_fee:
            return pricing.monthly_fee

        base -= pricing.discount_amount
        base -= (base * pricing.discount_percent // 100)

        return base


class TimeTable(models.Model):
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
        related_name='timeTable'
    )
    day_of_week = models.PositiveSmallIntegerField(
        choices=DAYS,
        verbose_name='روز هفته'
    )
    start_time = models.TimeField(verbose_name='ساعت شروع')
    end_time = models.TimeField(verbose_name='ساعت پایان')

    def __str__(self):
        age_ranges = ", ".join([str(age) for age in self.course.age_ranges.all()])
        return self.course.title + age_ranges + " در " + self.get_day_of_week_display() + " از " + self.start_time.strftime("%H:%M") + " تا " + self.end_time.strftime("%H:%M")
    
    def get_day_of_week_display(self):
        return dict(self.DAYS).get(self.day_of_week, 'نامشخص')
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["course", "day_of_week", "start_time", "end_time"],
                name="unique_timetable_course_day_start_end",
            ),
        ]
        verbose_name = 'جدول زمانی'
        verbose_name_plural = 'جدول های زمانی'


class Session(models.Model):

    STATUS_CHOICES = (
        ('finished', 'Finished'),
        ('unfinished', 'Unfinished'),
    )

    time_table = models.ForeignKey(
        TimeTable,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    date = models.DateField(verbose_name='تاریخ جلسه')

    attendance_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unfinished')

    def __str__(self):
        return self.time_table.course.title
    
    class Meta:
        unique_together = ('time_table', 'date')
        verbose_name = 'جلسه'
        verbose_name_plural = 'جلسات'
        ordering = ['-date']

        


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
        Enrollment,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        null=True,
        blank=True
    )

    note = models.TextField(max_length=256)

    class Meta:
        unique_together = ('session', 'student')
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['session']),
        ]
        verbose_name = 'حضور و غیاب'
        verbose_name_plural = 'حضور ها و غیاب ها'
    
    def __str__(self):
        return f"{self.student} - {self.session.date}"
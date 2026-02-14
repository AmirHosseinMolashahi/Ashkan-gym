from django.db import models
from account.models import CustomUser

# Create your models here.
class Registration(models.Model):
    STATUS_CHOICES = (
        ('draft', 'پیش‌نویس'),
        ('completed', 'تکمیل شده'),
        ('approved', 'تأیید شده'),
        ('rejected', 'رد شده'),
    )

    STEP_CHOICES = (
        (1, 'اطلاعات اولیه'),
        (2, 'تکمیل اطلاعات'),
        (3, 'بارگذاری مدارک'),
        (4, 'اضافه به کلاس'),
    )

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='registration',
        verbose_name='ورزشکار'
    )

    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_registrations',
        verbose_name='ثبت کننده',
    )

    current_step = models.PositiveSmallIntegerField(
        choices=STEP_CHOICES,
        default=1,
        verbose_name='مرحله ثبت نام',
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='وضعیت ثبت نام',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Registration - {self.user}"
    
    class Meta:
        verbose_name = 'ثبت نام'
        verbose_name_plural = 'ثبت نام ها'


class RegistrationDocument(models.Model):
    DOC_TYPES = (
        ('id_card', 'شناسنامه'),
        ('register_form', 'فرم ثبت نام'),
        ('insurance_card', 'بیمه ورزشی'),
        ('other', 'سایر'),
    )

    registration = models.ForeignKey(
        Registration,
        on_delete=models.CASCADE,
        related_name='documents'
    )

    document = models.FileField(upload_to='registration_docs/')
    doc_type = models.CharField(max_length=30, choices=DOC_TYPES)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.registration.user} - {self.doc_type}"
    
    class Meta:
        verbose_name = 'مدرک ثبت نام'
        verbose_name_plural = 'مدارک ثبت نام'
        unique_together = ('registration', 'doc_type')
  
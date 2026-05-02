from django.db import models
from django.db.models import Sum
from django.conf import settings
from datetime import timedelta

from training.models import Enrollment


class Invoice(models.Model):
    STATUS_CHOICES = (
        ("unpaid", "پرداخت نشده"),
        ("partially_paid", "نیمه پرداخت"),
        ("paid", "پرداخت شده"),
        ("canceled", "لغو شده"),
    )

    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name="invoices",
        verbose_name="ثبت‌ نام",
    )

    period_year = models.PositiveSmallIntegerField(verbose_name="سال دوره")
    period_month = models.PositiveSmallIntegerField(verbose_name="ماه دوره (۱-۱۲)")
    period_start = models.DateField(null=True, blank=True, verbose_name="شروع دوره")
    period_end = models.DateField(null=True, blank=True, verbose_name="پایان دوره")

    base_monthly_fee = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="شهریه ما0هانه پایه"
    )

    days_in_period = models.PositiveSmallIntegerField(
        default=30,
        verbose_name="تعداد روزهای دوره"
    )
    billed_days = models.PositiveSmallIntegerField(
        default=30,
        verbose_name="تعداد روزهای قابل محاسبه"
    )


    amount = models.PositiveIntegerField(verbose_name="مبلغ کل")
    manual_amount = models.PositiveIntegerField(null=True, blank=True, verbose_name="مبلغ دستی (در صورت وجود)")

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="unpaid",
        verbose_name="وضعیت",
    )

    due_date = models.DateField(null=True, blank=True, verbose_name="سررسید")
    manual_due_date = models.DateField(null=True, blank=True, verbose_name="سررسید دستی (در صورت وجود)")

    manual_reason = models.CharField(max_length=255, blank=True, verbose_name='ثبت دلیل تغییر', null=True)

    overdue_notified_count = models.PositiveSmallIntegerField(default=0, verbose_name="تعداد اخطار پس از سررسید")
    overdue_notified_at = models.DateTimeField(null=True, blank=True, verbose_name="تاریخ آخرین اخطار")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "صورتحساب"
        verbose_name_plural = "صورتحساب‌ها"
        unique_together = ("enrollment", "period_year", "period_month")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invoice {self.enrollment} - {self.period_year}/{self.period_month}"
    
    def paid_amount(self):
        return self.payments.filter(status="success").aggregate(
            total=Sum("amount")
        )["total"] or 0


    def last_success_payment(self):
        return self.payments.filter(status="success").order_by("-paid_at").first()

    def get_remaining_amount(self):
        return max(self.get_final_amount() - self.paid_amount(), 0)

    def calculate_status(self):
        paid = self.paid_amount()
        if paid <= 0:
            return "unpaid"
        if paid < self.get_final_amount():
            return "partially_paid"
        return "paid"

    def sync_status(self, save=True):
        new_status = self.calculate_status()
        if self.status != new_status:
            self.status = new_status
            if save:
                self.save(update_fields=["status", "updated_at"])
        return self.status
    
    def calculate_proration(self):
        if not self.period_start or not self.period_end:
            return self.amount, self.billed_days or 0, self.days_in_period or 0

        if not self.base_monthly_fee:
            return self.amount, self.billed_days or 0, self.days_in_period or 0

        start_date = self.enrollment.start_date
        end_date = self.enrollment.end_date

        effective_start = max(start_date, self.period_start)
        effective_end = min(end_date or self.period_end, self.period_end)

        days_in_period = (self.period_end - self.period_start).days + 1

        if effective_start > effective_end:
            return 0, 0, days_in_period

        billed_days = (effective_end - effective_start).days + 1

        amount = (self.base_monthly_fee * billed_days + days_in_period - 1) // days_in_period

        return amount, billed_days, days_in_period


    def apply_proration(self, save=True):
        amount, billed_days, days_in_period = self.calculate_proration()
        self.amount = amount
        self.billed_days = billed_days
        self.days_in_period = days_in_period
        if save:
            self.save(update_fields=["amount", "billed_days", "days_in_period", "updated_at"])
        return self.amount
    
    def get_final_amount(self):
        return self.manual_amount if self.manual_amount is not None else self.amount


    def get_final_due_date(self):
        return self.manual_due_date if self.manual_due_date else self.due_date


class Payment(models.Model):
    METHOD_CHOICES = (
        ("online", "آنلاین"),
        ("cash", "نقدی"),
        ("pos", "کارت‌خوان"),
        ("transfer", "کارت به کارت/واریز"),
    )

    STATUS_CHOICES = (
        ("pending", "در انتظار"),
        ("success", "موفق"),
        ("failed", "ناموفق"),
        ("refunded", "مسترد شده"),
    )

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="payments",
        verbose_name="صورتحساب",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
        verbose_name="پرداخت‌کننده",
    )

    amount = models.PositiveIntegerField(verbose_name="مبلغ پرداخت")
    method = models.CharField(
        max_length=20,
        choices=METHOD_CHOICES,
        default="online",
        verbose_name="روش پرداخت",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        verbose_name="وضعیت پرداخت",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name="زمان پرداخت")

    class Meta:
        verbose_name = "پرداخت"
        verbose_name_plural = "پرداخت‌ها"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment {self.id} - {self.amount} for {self.invoice}"


class OnlinePayment(models.Model):
    GATEWAY_CHOICES = (
        ("zarinpal", "زرین‌پال"),
        ("idpay", "آیدی‌پی"),
        ("other", "سایر"),
    )

    payment = models.OneToOneField(
        Payment,
        on_delete=models.CASCADE,
        related_name="online_detail",
        verbose_name="پرداخت",
    )
    gateway = models.CharField(
        max_length=50,
        choices=GATEWAY_CHOICES,
        default="zarinpal",
        verbose_name="درگاه",
    )

    authority = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Authority / Track ID",
    )
    ref_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="کد پیگیری نهایی",
    )
    card_mask = models.CharField(
        max_length=30,
        blank=True,
        verbose_name="شماره کارت ماسک‌شده",
    )

    raw_request = models.JSONField(
        null=True, blank=True, verbose_name="درخواست به درگاه (خام)"
    )
    raw_response = models.JSONField(
        null=True, blank=True, verbose_name="پاسخ درگاه (خام)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True, verbose_name="زمان تأیید")

    class Meta:
        verbose_name = "پرداخت آنلاین"
        verbose_name_plural = "پرداخت‌های آنلاین"

    def __str__(self):
        return f"OnlinePayment {self.payment_id} - {self.gateway}"


class PricingRule(models.Model):
    enrollment = models.OneToOneField(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='pricing'
    )

    monthly_fee = models.PositiveIntegerField(null=True, blank=True)
    discount_percent = models.PositiveSmallIntegerField(default=0)
    discount_amount = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = "قانون قیمت‌گذاری"
        verbose_name_plural = "قوانین قیمت‌گذاری"
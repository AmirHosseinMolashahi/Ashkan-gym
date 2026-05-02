from celery import shared_task
import jdatetime

from training.utils import (
    generate_shamsi_month_sessions,
    generate_shamsi_month_attendances,
)
from payment.utils import generate_shamsi_month_invoices
from celery import shared_task
from django.utils import timezone
from django.db.models import Q
from .models import Invoice
from notifications.utils import create_and_send_notification

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def run_monthly_generation(self, year=None, month=None, force=False):
    """
    Run monthly generation in strict order:
    1) sessions
    2) attendances
    3) invoices
    """
    today = jdatetime.date.today()
    year = year or today.year
    month = month or today.month

    if not force and today.day != 1:
        return {
            "status": "skipped",
            "reason": "Not first day of Jalali month",
            "period": f"{year}/{month}",
        }

    try:
        sessions_count = generate_shamsi_month_sessions(year=year, month=month)
        attendances_count = generate_shamsi_month_attendances(year=year, month=month)
        invoices_count = generate_shamsi_month_invoices(year=year, month=month)

        return {
            "status": "ok",
            "period": f"{year}/{month}",
            "sessions": sessions_count,
            "attendances": attendances_count,
            "invoices": invoices_count,
        }
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task
def send_overdue_invoice_notifications():
    today = timezone.now().date()

    invoices = Invoice.objects.select_related(
        "enrollment__student",
        "enrollment__course"
    ).filter(
        Q(due_date__lt=today),
    )

    for invoice in invoices:
        remaining = invoice.get_remaining_amount()

        # ❌ اگر تسویه شده یا قبلاً نوتیف شده
        if remaining <= 0 or invoice.overdue_notified_count >= 1:
            continue

        student = invoice.enrollment.student

        # 📩 ارسال نوتیف
        create_and_send_notification(
            user=student,
            title=f"سررسید پرداخت گذشته",
            message=f"فاکتور دوره {invoice.enrollment.course.title} هنوز پرداخت نشده است.",
            type="warning",
            category="tuition",
        )

        # ✅ علامت‌گذاری
        invoice.overdue_notified_count += 1 
        invoice.overdue_notified_at = timezone.now()
        invoice.save(update_fields=[
            "overdue_notified_count",
            "overdue_notified_at"
        ])
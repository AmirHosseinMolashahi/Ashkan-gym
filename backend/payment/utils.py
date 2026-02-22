import jdatetime
from datetime import timedelta
from django.db import transaction

from training.models import Enrollment
from .models import Invoice


def _last_day_of_jalali_month(year: int, month: int) -> int:
    d = jdatetime.date(year, month, 1)
    while True:
        try:
            d = d.replace(day=d.day + 1)
        except ValueError:
            return d.day


@transaction.atomic
def generate_shamsi_month_invoices(year=None, month=None, due_day=7):
    today = jdatetime.date.today()
    year = year or today.year
    month = month or today.month

    last_day = _last_day_of_jalali_month(year, month)
    due_day = min(due_day, last_day)
    due_date_gregorian = jdatetime.date(year, month, due_day).togregorian()

    enrollments = Enrollment.objects.filter(
        status="active",
        course__is_active=True,
    ).select_related("course")

    invoice_objects = [
        Invoice(
            enrollment=e,
            period_year=year,
            period_month=month,
            amount=e.course.price,
            due_date=due_date_gregorian,
        )
        for e in enrollments
    ]

    created = Invoice.objects.bulk_create(
        invoice_objects,
        ignore_conflicts=True,  # به خاطر unique_together امنه
    )
    return len(created)

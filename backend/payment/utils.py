import jdatetime
from datetime import timedelta
from django.db import transaction
from django.db.models import Q

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
def generate_shamsi_month_invoices(year=None, month=None, default_due_day=7):
    today = jdatetime.date.today()
    year = year or today.year
    month = month or today.month

    last_day = _last_day_of_jalali_month(year, month)

    period_start = jdatetime.date(year, month, 1).togregorian()
    period_end = jdatetime.date(year, month, last_day).togregorian()

    enrollments = Enrollment.objects.filter(
        course__is_active=True,
    ).filter(
        start_date__lte=period_end
    ).filter(
        Q(end_date__isnull=True) | Q(end_date__gte=period_start)
    ).select_related("course", "pricing")

    invoice_objects = []

    for e in enrollments:
        # 🧾 قیمت پایه
        base_price = e.course.price

        pricing = getattr(e, "pricing", None)

        if pricing:
            if pricing.monthly_fee:
                base_price = pricing.monthly_fee
            else:
                base_price -= pricing.discount_amount
                base_price -= (base_price * pricing.discount_percent // 100)

        # 👇 جلوگیری از منفی شدن
        final_price = max(base_price, 0)

        # 📅 due date
        due_day = e.custom_due_day or default_due_day
        due_day = min(due_day, last_day)
        due_date = jdatetime.date(year, month, due_day).togregorian()

        invoice_objects.append(
            Invoice(
                enrollment=e,
                period_year=year,
                period_month=month,

                # 🔥 snapshot مهم
                amount=final_price,
                base_monthly_fee=final_price,

                period_start=period_start,
                period_end=period_end,

                due_date=due_date,
            )
        )

    created = Invoice.objects.bulk_create(
        invoice_objects,
        ignore_conflicts=True,
    )

    # 🔥 اعمال prorate
    for invoice in created:
        invoice.apply_proration()

    return len(created)
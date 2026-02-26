from celery import shared_task
import jdatetime

from training.utils import (
    generate_shamsi_month_sessions,
    generate_shamsi_month_attendances,
)
from payment.utils import generate_shamsi_month_invoices


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

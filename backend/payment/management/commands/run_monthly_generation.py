from django.core.management.base import BaseCommand
from django.db import transaction
import jdatetime

from training.utils import (
    generate_shamsi_month_sessions,
    generate_shamsi_month_attendances,
)
from payment.utils import generate_shamsi_month_invoices


class Command(BaseCommand):
    help = "Generate sessions, attendances, and invoices for a Jalali month"

    def add_arguments(self, parser):
        parser.add_argument("--year", type=int, default=None)
        parser.add_argument("--month", type=int, default=None)
        parser.add_argument("--force", action="store_true")

    @transaction.atomic
    def handle(self, *args, **options):
        today = jdatetime.date.today()
        year = options["year"] or today.year
        month = options["month"] or today.month

        if not options["force"] and today.day != 1:
            self.stdout.write(self.style.WARNING("Today is not day 1 of Jalali month. Skipped."))
            return

        s_count = generate_shamsi_month_sessions(year=year, month=month)
        a_count = generate_shamsi_month_attendances(year=year, month=month)
        i_count = generate_shamsi_month_invoices(year=year, month=month)

        self.stdout.write(self.style.SUCCESS(
            f"Done. sessions={s_count}, attendances={a_count}, invoices={i_count}, period={year}/{month}"
        ))

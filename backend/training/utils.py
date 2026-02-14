# course/utils/session_generator.py

import jdatetime
from django.db import transaction
from datetime import timedelta
from .models import TimeTable, Session, Attendance, Enrollment


def generate_shamsi_month_sessions(year=None, month=None):
    today = jdatetime.date.today()

    year = year or today.year
    month = month or today.month

    current_day = jdatetime.date(year, month, 1)

    created_count = 0

    timetables = TimeTable.objects.filter(course__is_active=True)

    while current_day.month == month:
        # jdatetime: شنبه=0 ... جمعه=6
        weekday = current_day.weekday() + 1

        for timetable in timetables:
            if timetable.day_of_week == weekday:
                _, created = Session.objects.get_or_create(
                    time_table=timetable,
                    date=current_day.togregorian()
                )
                if created:
                    created_count += 1

        current_day += jdatetime.timedelta(days=1)

    return created_count



@transaction.atomic
def generate_shamsi_month_attendances(year=None, month=None):
    today = jdatetime.date.today()

    year = year or today.year
    month = month or today.month

    start_shamsi = jdatetime.date(year, month, 1)

    if month == 12:
        next_month = jdatetime.date(year + 1, 1, 1)
    else:
        next_month = jdatetime.date(year, month + 1, 1)

    start_date = start_shamsi.togregorian()
    end_date = (next_month - jdatetime.timedelta(days=1)).togregorian()

    created_count = 0

    sessions = Session.objects.filter(
        date__range=(start_date, end_date),
        time_table__course__is_active=True
    ).select_related('time_table__course')

    for session in sessions:
        # دانش‌آموزهای همین کورس
        enrollments = Enrollment.objects.filter(
            course=session.time_table.course,
            status='active'   # اگر مقدار دیگه‌ای داری اصلاح کن
        )

        attendance_objects = [
            Attendance(
                session=session,
                student=enrollment,
                status='absent',
                note=''
            )
            for enrollment in enrollments
        ]

        created = Attendance.objects.bulk_create(
            attendance_objects,
            ignore_conflicts=True
        )

        created_count += len(created)

    return created_count

def get_current_shamsi_month_range():
    today = jdatetime.date.today()

    start_shamsi = jdatetime.date(today.year, today.month, 1)
    end_shamsi = start_shamsi

    # برو تا آخر ماه
    while end_shamsi.month == today.month:
        end_shamsi += jdatetime.timedelta(days=1)

    end_shamsi -= jdatetime.timedelta(days=1)

    return (
        start_shamsi.togregorian(),
        end_shamsi.togregorian()
    )

def get_previous_shamsi_month_range():
    today = jdatetime.date.today()

    if today.month == 1:
        year = today.year - 1
        month = 12
    else:
        year = today.year
        month = today.month - 1

    start = jdatetime.date(year, month, 1)
    end = start

    while end.month == month:
        end += jdatetime.timedelta(days=1)

    end -= jdatetime.timedelta(days=1)

    return start.togregorian(), end.togregorian()

PERSIAN_MONTHS = {
    1: 'فروردین',
    2: 'اردیبهشت',
    3: 'خرداد',
    4: 'تیر',
    5: 'مرداد',
    6: 'شهریور',
    7: 'مهر',
    8: 'آبان',
    9: 'آذر',
    10: 'دی',
    11: 'بهمن',
    12: 'اسفند',
}


def get_previous_shamsi_month_name():
    today = jdatetime.date.today()

    if today.month == 1:
        year = today.year - 1
        month = 12
    else:
        year = today.year
        month = today.month - 1

    month_name = PERSIAN_MONTHS[month]

    return f'{month_name}'


def get_shamsi_month_range(year: int, month: int):
    """
    ورودی: سال و ماه شمسی
    خروجی: (start_date, end_date) میلادی
    """
    start = jdatetime.date(year, month, 1)

    # پیدا کردن آخرین روز ماه
    end = start
    while end.month == month:
        end += jdatetime.timedelta(days=1)
    end -= jdatetime.timedelta(days=1)

    return start.togregorian(), end.togregorian()
from rest_framework import serializers
from .models import Course, Enrollment, AgeRange, TimeTable, Session
from account.models import CustomUser
from django.db import transaction
from django.db.models import Count, Q
from datetime import timedelta, date
from django.utils import timezone
from notifications.utils import create_and_send_notification
from .models import Session, Attendance
from .utils import get_current_shamsi_month_range, get_previous_shamsi_month_range, get_previous_shamsi_month_name
import jdatetime
import datetime

#سریالایز کردن رده های سنی
class AgeRangeSerializers(serializers.ModelSerializer):
    class Meta:
        model = AgeRange
        fields = ["id", "key", "title"]

#مینی سریالایزر مربی
class CoachMiniSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ("id", "full_name")

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

#سریالایزر اطلاعات ورزشکار
class StudentSerializer(serializers.ModelSerializer):
    full_name =serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            'id',
            'national_id',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'profile_picture',
            'phone_number',
            'role',
            'is_active'
        )
    def get_full_name(self, obj):
        return obj.get_full_name()

#سریالایزر جداول زمانی
class TimeTableSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(
        source='course.title',
        read_only=True
    )
    day_label = serializers.CharField(
        source='get_day_of_week_display',
        read_only=True
    )

    class Meta:
        model = TimeTable
        fields = "__all__"

#سریالایزر اطلاعات کلاس
class CourseListSerializers(serializers.ModelSerializer):
    enrollment_count = serializers.IntegerField(read_only=True)
    timeTable = TimeTableSerializer(many=True, read_only=True)
    age_ranges = AgeRangeSerializers(many=True, read_only=True)
    coach = CoachMiniSerializer(read_only=True)
    gender_label = serializers.CharField(
        source="get_gender_display",
        read_only=True
    )
    schedule = serializers.SerializerMethodField()
    session_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_schedule(self, obj):
        tables = obj.timeTable.all()

        if not tables:
            return None

        # روزها
        days = [t.get_day_of_week_display() for t in tables]

        # فرض: ساعت‌ها یکی هستن
        start_time = tables[0].start_time.strftime('%H:%M')
        end_time = tables[0].end_time.strftime('%H:%M')

        return f"{' و '.join(days)} {start_time}–{end_time}"
    
    def get_session_duration(self, obj):
        table = obj.timeTable.first() # گرفتن اولین زمان‌بندی موجود
        if not table or not table.start_time or not table.end_time:
            return None

        # تبدیل time به datetime برای امکان محاسبه اختلاف
        dummy_date = date.today()
        dt1 = datetime.datetime.combine(dummy_date, table.start_time)
        dt2 = datetime.datetime.combine(dummy_date, table.end_time)

        # اگر ساعت پایان قبل از شروع باشد (مثلاً کلاس شبانه که تا بامداد طول می‌کشد)
        if dt2 <= dt1:
            dt2 += timedelta(days=1)

        duration = dt2 - dt1
        
        # استخراج ساعت و دقیقه از اختلاف
        total_seconds = int(duration.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60

        if hours > 0:
            return f"{hours} ساعت و {minutes} دقیقه"
        return f"{minutes} دقیقه"

#سریالایزر اطلاعات کلاس 2
class CoursesDetailSerializers(serializers.ModelSerializer):
    age_ranges = AgeRangeSerializers(many=True, read_only=True)
    gender_label = serializers.CharField(
        source="get_gender_display",
        read_only=True
    )

    class Meta:
        model = Course
        fields = '__all__'

#سریالایزر اطلاعات ثبت نام شده
class EnrollmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    attendance_percentage = serializers.SerializerMethodField()
    total_sessions = serializers.IntegerField(read_only=True)
    present_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Enrollment
        fields = (
            'id',
            'student',
            'status',
            'joined_at',
            'attendance_percentage',
            'total_sessions',
            'present_count',
        )

    def get_attendance_percentage(self, obj):
        if obj.total_sessions == 0:
            return 0

        return round(obj.attendance_percentage, 1)

#سریالایزر ثبت نام ورزشکار
class AddEnrollmentSerializer(serializers.Serializer):
    students = serializers.ListField(
        child=serializers.IntegerField()
    )
    course = serializers.IntegerField()

    def _jalali_month_bounds_from_gregorian(self, greg_date):
        """
        ورودی: تاریخ میلادی
        خروجی: (jalali_year, jalali_month, period_start_gregorian, period_end_gregorian)
        """
        jdate = jdatetime.date.fromgregorian(date=greg_date)
        year = jdate.year
        month = jdate.month

        start_j = jdatetime.date(year, month, 1)
        if month == 12:
            next_j = jdatetime.date(year + 1, 1, 1)
        else:
            next_j = jdatetime.date(year, month + 1, 1)

        period_start = start_j.togregorian()
        period_end = (next_j - jdatetime.timedelta(days=1)).togregorian()

        return year, month, period_start, period_end

    def _create_attendance_for_new_enrollment(self, enrollment):
        """
        فقط از تاریخ عضویت تا انتهای همان ماه attendance بساز.
        """
        join_date = timezone.localdate(enrollment.joined_at)
        _, _, period_start, period_end = self._jalali_month_bounds_from_gregorian(join_date)

        effective_start = max(join_date, period_start)

        sessions = Session.objects.filter(
            time_table__course=enrollment.course,
            date__gte=effective_start,
            date__lte=period_end
        )

        attendance_objects = [
            Attendance(
                session=session,
                student=enrollment,
                status=None,
                note=''
            )
            for session in sessions
        ]

        Attendance.objects.bulk_create(attendance_objects, ignore_conflicts=True)

    def _create_prorated_invoice_for_new_enrollment(self, enrollment):
        """
        invoice همان ماه را بر اساس تعداد جلسات باقی‌مانده از تاریخ عضویت تا آخر ماه بساز.
        مبلغ = ceil(full_price * remaining_sessions / total_month_sessions)
        """
        from payment.models import Invoice  # import local برای جلوگیری از circular import

        join_date = timezone.localdate(enrollment.joined_at)
        year, month, period_start, period_end = self._jalali_month_bounds_from_gregorian(join_date)
        effective_start = max(join_date, period_start)

        total_month_sessions = Session.objects.filter(
            time_table__course=enrollment.course,
            date__gte=period_start,
            date__lte=period_end
        ).count()

        remaining_sessions = Session.objects.filter(
            time_table__course=enrollment.course,
            date__gte=effective_start,
            date__lte=period_end
        ).count()

        if total_month_sessions > 0:
            amount = (enrollment.course.price * remaining_sessions + total_month_sessions - 1) // total_month_sessions
        else:
            amount = 0

        # سررسید: روز 7 همان ماه (اگر ماه کوتاه بود، آخرین روز همان ماه)
        if month == 12:
            next_j = jdatetime.date(year + 1, 1, 1)
        else:
            next_j = jdatetime.date(year, month + 1, 1)

        last_day = (next_j - jdatetime.timedelta(days=1)).day
        due_day = min(7, last_day)
        due_date = jdatetime.date(year, month, due_day).togregorian()

        Invoice.objects.update_or_create(
            enrollment=enrollment,
            period_year=year,
            period_month=month,
            defaults={
                "amount": amount,
                "due_date": due_date,
                "period_start": period_start,
                "period_end": period_end,
                "base_monthly_fee": enrollment.course.price,
                "days_in_period": (period_end - period_start).days + 1,
                "billed_days": (period_end - effective_start).days + 1 if effective_start <= period_end else 0,
                "status": "unpaid",
            }
        )

    @transaction.atomic
    def create(self, validated_data):
        student_ids = validated_data['students']
        course_id = validated_data['course']

        students = CustomUser.objects.filter(id__in=student_ids)
        course = Course.objects.get(id=course_id)

        existing_ids = set(
            Enrollment.objects.filter(
                course=course,
                student__in=students
            ).values_list('student_id', flat=True)
        )

        enrollments = [
            Enrollment(student=s, course=course)
            for s in students
            if s.id not in existing_ids
        ]

        created_enrollments = Enrollment.objects.bulk_create(enrollments)

        for enrollment in created_enrollments:
            self._create_attendance_for_new_enrollment(enrollment)
            self._create_prorated_invoice_for_new_enrollment(enrollment)

            create_and_send_notification(
                user=enrollment.student,
                title=f"به کلاس '{course.title}' اضافه شدید",
                message=f"شما به کلاس {course.title} اضافه شدید و می‌توانید با رفتن به بخش کلاس‌ها وضعیت را چک کنید.",
                type="info",
                category="courses",
            )

        return created_enrollments



# اطلاعات ثبت نامی های یک کلاس
class EnrollmentListSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source='student.get_full_name',
        read_only=True
    )
    course_title = serializers.CharField(
        source='course.title',
        read_only=True
    )

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'student',
            'student_name',
            'course',
            'course_title',
            'status',
            'joined_at'
        ]


class SessionSerializer(serializers.ModelSerializer):
    day_of_week = serializers.CharField(
        source='time_table.get_day_of_week_display'
    )
    start_time = serializers.TimeField(source='time_table.start_time')
    end_time = serializers.TimeField(source='time_table.end_time')
    date_jalali = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = ('id', 'date', 'day_of_week', 'start_time', 'end_time', 'date_jalali', 'attendance_status',)
    
    def get_date_jalali(self, obj):
        if obj.date:
            return jdatetime.datetime.fromgregorian(datetime=obj.date).strftime("%Y/%m/%d")
        return None

class UserEnrollmnetsSerializers(serializers.ModelSerializer):
    course = CourseListSerializers(read_only=True)
    joined_at_jalali = serializers.SerializerMethodField()
    sessions = serializers.SerializerMethodField()
    next_session = serializers.SerializerMethodField()
    attendance_summary = serializers.SerializerMethodField()
    remaining_sessions = serializers.SerializerMethodField()
    

    class Meta:
        model = Enrollment
        fields = '__all__'

    def get_joined_at_jalali(self, obj):
        if obj.joined_at:
            return jdatetime.datetime.fromgregorian(datetime=obj.joined_at).strftime("%Y/%m/%d %H:%M")
        return None
    
    def get_sessions(self, obj):
        start_date, end_date = get_current_shamsi_month_range()

        sessions = Session.objects.filter(
            time_table__course=obj.course,
            date__range=(start_date, end_date)
        ).order_by('date')

        return StudentSessionSerializer(
            sessions,
            many=True,
            context=self.context
        ).data
    
    def get_remaining_sessions(self, obj):
        start_date, end_date = get_current_shamsi_month_range()

        return Session.objects.filter(
            time_table__course=obj.course,
            date__range=(start_date, end_date),
            attendance_status='unfinished'
        ).count()
    
    def get_attendance_summary(self, obj):
        start_date, end_date = get_current_shamsi_month_range()

        user = obj.student

        qs = Attendance.objects.filter(
            session__time_table__course=obj.course,
            session__date__range=(start_date, end_date),
            student__student=user
        )

        summary = qs.aggregate(
            present_count=Count('id', filter=Q(status='present')),
            absent_count=Count('id', filter=Q(status='absent')),
            late_count=Count('id', filter=Q(status='late')),
            total=Count('id')
        )
        total = summary['total'] or 0
        present = summary['present_count'] or 0
        late = summary['late_count'] or 0

        summary['attendance_percentage'] = (
            round(((present + late) / total) * 100, 1) if total > 0 else 0
        )

        return summary

    def get_next_session(self, obj):
        today = datetime.date.today()

        session = (
            Session.objects
            .filter(
                time_table__course=obj.course,
                date__gte=today
            )
            .order_by('date')
            .select_related('time_table')
            .first()
        )

        if not session:
            return None

        return {
            'id': session.id,
            'date': session.date,
            'day_of_week': session.time_table.get_day_of_week_display(),
            'start_time': session.time_table.start_time,
            'end_time': session.time_table.end_time,
        }


class PrevMonthSessionSerializer(serializers.ModelSerializer):
    course = CourseListSerializers(read_only=True)
    joined_at_jalali = serializers.SerializerMethodField()
    prev_sessions = serializers.SerializerMethodField()
    prev_month_name = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = '__all__'

    def get_joined_at_jalali(self, obj):
        if obj.joined_at:
            return jdatetime.datetime.fromgregorian(datetime=obj.joined_at).strftime("%Y/%m/%d %H:%M")
        return None
    
    def get_prev_sessions(self, obj):
        start_date, end_date = get_previous_shamsi_month_range()

        qs = Session.objects.filter(
            time_table__course=obj.course,
            date__range=(start_date, end_date)
        ).select_related('time_table').order_by('date')

        return SessionSerializer(qs, many=True).data

    def get_prev_month_name(self, obj):
        return get_previous_shamsi_month_name()
    
#سریالایزر ورزشکار
#سریالایزر برای هر جلسه ورزشکار به همراه وضعیت حضور و غیاب
class StudentSessionSerializer(serializers.ModelSerializer):
    day_of_week = serializers.CharField(
        source='time_table.get_day_of_week_display'
    )
    date_jalali = serializers.SerializerMethodField()
    attendance_status_user = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = (
            'id',
            'date',
            'date_jalali',
            'attendance_status',
            'attendance_status_user',
            'day_of_week',
        )

    def get_date_jalali(self, obj):
        if obj.date:
            return jdatetime.datetime.fromgregorian(
                datetime=obj.date
            ).strftime("%Y/%m/%d")
        return None

    def get_attendance_status_user(self, obj):
        user = self.context['request'].user
        attendance = obj.attendances.filter(
            student__student=user
        ).first()
        return attendance.status if attendance else None



class MonthlyAttendanceSummarySerializer(serializers.Serializer):
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    month_name = serializers.CharField()
    total_sessions = serializers.IntegerField()
    present_count = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()
    attendance_percentage_status = serializers.CharField()


# سریالایزر مربی

class SessionAttendanceSerializers(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source='student.student',  # اگر Enrollment به Student وصله
        read_only=True
    )
    profile_picture = serializers.ImageField(
        source='student.student.profile_picture',
        read_only=True
    )
    national_id = serializers.IntegerField(
        source='student.student.national_id',
        read_only=True
    )
    class Meta:
        model = Attendance
        fields = [
            'id',
            'student',
            'national_id',
            'student_name',
            'profile_picture',
            'status',
            'note',
        ]


class AttendanceBulkUpdateSerializer(serializers.Serializer):
    student = serializers.IntegerField()
    status = serializers.ChoiceField(
        choices=['present', 'absent', 'late']
    )
    note = serializers.CharField(required=False, allow_blank=True, max_length=256)


class AthleteDashboardSerializer(serializers.Serializer):
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    month_name = serializers.CharField()

    total_courses = serializers.IntegerField()
    total_sessions = serializers.IntegerField()
    total_present = serializers.IntegerField()
    total_absent = serializers.IntegerField()
    remaining_sessions = serializers.IntegerField()

    attendance_percentage = serializers.FloatField()

    previous_attendance_percentage = serializers.FloatField(allow_null=True)
    attendance_difference = serializers.FloatField(allow_null=True)
    trend = serializers.CharField(allow_null=True)
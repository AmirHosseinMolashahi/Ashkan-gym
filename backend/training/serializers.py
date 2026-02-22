from rest_framework import serializers
from .models import Course, Enrollment, AgeRange, TimeTable, Session
from account.models import CustomUser
from django.db import transaction
from django.db.models import Count, Q
from datetime import timedelta, date
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

    def create(self, validated_data):
        print(validated_data['students'])
        student_ids = validated_data['students']
        course_id = validated_data['course']

        students = CustomUser.objects.filter(id__in=student_ids)
        course = Course.objects.get(id=course_id)

        existing_ids = Enrollment.objects.filter(
            course=course,
            student__in=students
        ).values_list('student_id', flat=True)

        enrollments = [
            Enrollment(student=s, course=course)
            for s in students
            if s.id not in existing_ids
        ]

        Enrollment.objects.bulk_create(enrollments)

        for s in students:
            if s.id not in existing_ids:
                create_and_send_notification(
                    user=s,
                    title=f"به کلاس '{course.title}' اضافه شدید",
                    message=f"شما به کلاس {course.title} اضافه شدید و میتوانید با رفتن به بخش کلاس ها وضعیت را چک کنید.",
                    type="info",
                    category="courses",
                )
        return enrollments


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
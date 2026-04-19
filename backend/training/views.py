from django.shortcuts import render, get_object_or_404
from django.core.exceptions import PermissionDenied
from django.db.models import Prefetch, Count, Q, F, FloatField, ExpressionWrapper, Case, When, Value
from django.db import transaction
from django.utils import timezone

import datetime
import jdatetime
from collections import defaultdict

from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from account.permissions import IsCoachOrManager, IsManager
from account.models import CustomUser

from .models import Course, Enrollment, TimeTable, Session, Attendance, AgeRange
from .utils import get_current_shamsi_month_range, get_previous_shamsi_month_range, get_shamsi_month_range, PERSIAN_MONTHS 
from .serializers import (
    CourseListSerializers,
    AddEnrollmentSerializer,
    EnrollmentListSerializer,
    TimeTableSerializer,
    CoursesDetailSerializers,
    EnrollmentSerializer,
    StudentSerializer,
    UserEnrollmnetsSerializers,
    SessionSerializer,
    AgeRangeSerializers,
    CoachMiniSerializer,
    PrevMonthSessionSerializer,
    SessionAttendanceSerializers,
    AttendanceBulkUpdateSerializer,
    MonthlyAttendanceSummarySerializer,
    AthleteDashboardSerializer,
    CourseCreateSerializer,
    TimeTableBulkItemSerializer
    )
# Create your views here.

#نمایش تمام کلاس ها به مدیر و به کلاس های مربی
class CoursesListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]
    serializer_class = CourseListSerializers

    def get_queryset(self):
        user = self.request.user

        queryset = Course.objects.annotate(
            enrollment_count=Count('enrollments')
        ).prefetch_related(
            Prefetch(
                'timeTable',
                queryset=TimeTable.objects.order_by('day_of_week', 'start_time')
            )
        ).order_by('-created_at')

        if user.roles.filter(name='manager').exists():
            return queryset

        if user.roles.filter(name='coach').exists():
            return queryset.filter(coach=user)

        raise PermissionDenied('شما دسترسی به این بخش را ندارید')

#نمایش اطلاعات کلاس به مدیر و مربی
class CoursesDetailView(RetrieveAPIView):
    queryset = Course.objects.all()
    permission_classes = [IsAuthenticated, IsCoachOrManager]
    serializer_class = CourseListSerializers
    lookup_field = 'id'


class CourseFormOptionsView(APIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]

    def get(self, request):
        coaches = CustomUser.objects.filter(roles__name="coach", is_active=True).only(
            "id", "first_name", "last_name"
        )
        age_ranges = AgeRange.objects.all().only("id", "key", "title")

        return Response({
            "coaches": CoachMiniSerializer(coaches, many=True).data,
            "age_ranges": AgeRangeSerializers(age_ranges, many=True).data,
            "gender_choices": [
                {"value": "male", "label": "آقایان"},
                {"value": "female", "label": "بانوان"},
                {"value": "both", "label": "عمومی"},
            ],
            "class_status_choices": [
                {"value": "public", "label": "عمومی"},
                {"value": "private", "label": "خصوصی"},
            ],
        })

class CourseCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsManager]
    serializer_class = CourseCreateSerializer


class TimeTableBulkCreateView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    @transaction.atomic
    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        user = request.user

        # # coach فقط برای کلاس خودش
        # if user.roles.filter(name="coach").exists() and course.coach_id != user.id:
        #     raise PermissionDenied("شما اجازه ایجاد جدول زمانی برای این کلاس را ندارید.")

        serializer = TimeTableBulkItemSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        rows = serializer.validated_data

        # جلوگیری از تکرار روز داخل همین درخواست
        day_values = [r["day_of_week"] for r in rows]
        if len(day_values) != len(set(day_values)):
            return Response(
                {"detail": "روزهای تکراری در لیست ارسالی وجود دارد."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        objects = [
            TimeTable(
                course=course,
                day_of_week=row["day_of_week"],
                start_time=row["start_time"],
                end_time=row["end_time"],
            )
            for row in rows
        ]

        for row in rows:
            has_conflict = TimeTable.objects.filter(
                day_of_week=row["day_of_week"],
                start_time__lt=row["end_time"],
                end_time__gt=row["start_time"],
            ).exclude(course=course).exists()   # اگر می‌خواهی حتی داخل همان course هم تداخل نداشته باشد، exclude را بردار

            if has_conflict:
                return Response(
                    {"detail": "این بازه زمانی با کلاس دیگری تداخل دارد."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        created = TimeTable.objects.bulk_create(objects)

        return Response(
            TimeTableSerializer(created, many=True).data,
            status=status.HTTP_201_CREATED,
        )


class CourseUpdateView(UpdateAPIView):
    queryset = Course.objects.all()
    permission_classes = [IsAuthenticated, IsManager]
    serializer_class = CourseCreateSerializer
    lookup_field = 'id'


class CourseDeleteView(DestroyAPIView):
    queryset = Course.objects.all()
    permission_classes = [IsAuthenticated, IsManager]
    lookup_field = 'id'


class TimeTableUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsManager]

    @transaction.atomic
    def put(self, request, course_id):
        serializer = TimeTableBulkItemSerializer(data=request.data, many=True, context={"course_id": course_id})
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # 1. چک داخل request
        grouped = defaultdict(list)

        for item in data:
            grouped[item["day_of_week"]].append(item)

        for day, items in grouped.items():
            items = sorted(items, key=lambda x: x["start_time"])

            for i in range(len(items) - 1):
                if items[i]["end_time"] > items[i + 1]["start_time"]:
                    raise ValidationError(f"در روز {day} تایم‌ها با هم تداخل دارند.")

        # 2. چک با دیتابیس
        days = [item["day_of_week"] for item in data]

        existing_qs = TimeTable.objects.filter(day_of_week__in=days)

        for item in data:
            qs = existing_qs.filter(day_of_week=item["day_of_week"])

            for obj in qs:
                # اگر همین course هست، ردش کن (برای update)
                if obj.course_id == course_id:
                    continue

                if (item["start_time"] < obj.end_time) and (item["end_time"] > obj.start_time):
                    raise ValidationError(
                        f"این بازه با یک کلاس دیگر در همین روز تداخل دارد."
                    )

        existing_qs = TimeTable.objects.filter(course_id=course_id)
        existing_map = {
            obj.day_of_week: obj for obj in existing_qs
        }

        to_create = []
        to_update = []
        incoming_days = set()

        # 1. تفکیک create / update
        for item in data:
            day = item['day_of_week']
            incoming_days.add(day)

            if day in existing_map:
                obj = existing_map[day]

                obj.start_time = item["start_time"]
                obj.end_time = item["end_time"]

                to_update.append(obj)
            else:
                to_create.append(
                    TimeTable(course_id=course_id, **item)
                )

        # 2. bulk update (بهینه)
        if to_update:
            TimeTable.objects.bulk_update(
                to_update,
                fields=["start_time", "end_time"]
            )

        # 3. bulk create
        if to_create:
            TimeTable.objects.bulk_create(to_create)
        
        # ✅ delete (روزهایی که حذف شدن)
        TimeTable.objects.filter(course_id=course_id)\
            .exclude(day_of_week__in=incoming_days)\
            .delete()

        # 4. refresh output
        final_qs = TimeTable.objects.filter(course_id=course_id)

        return Response(TimeTableSerializer(final_qs, many=True).data)
    
        



#نمایش لیست همه‌ی کاربر ها به مدیر و نمایش لیست هر شخص ثبت نام شده به مربی
class AthleteListView(ListAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated, IsCoachOrManager]

    def get_queryset(self):
        user = self.request.user

        # مدیر → همه کاربران
        if user.is_staff or user.roles.filter(name='manager').exists():
            return CustomUser.objects.filter(is_active=True)

        # مربی → فقط کسانی که خودش ثبت‌نام کرده
        if user.roles.filter(name='coach').exists():
            return CustomUser.objects.filter(
                registration__created_by=user
            ).distinct()

        return CustomUser.objects.none()

#افزودن ورزشکار توسط مدیر و مربی
class AddEnrollmentView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]
    serializer_class = AddEnrollmentSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)

        print(serializer.errors)
        return Response(status=status.HTTP_400_BAD_REQUEST)

#نمایش لیست ثبت نامی های یک کلاس
class CoursesEnrollmentsView(ListAPIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        start_date, end_date = get_current_shamsi_month_range()

        return (
            Enrollment.objects
            .filter(
                course_id=course_id,
                status='active'
            )
            .select_related('student')
            .annotate(
                total_sessions=Count(
                    'attendances',
                    filter=Q(
                        attendances__session__attendance_status='finished',
                        attendances__session__date__range=(start_date, end_date)
                    ),
                    distinct=True
                ),

                present_count=Count(
                    'attendances',
                    filter=Q(
                        attendances__session__attendance_status='finished',
                        attendances__session__date__range=(start_date, end_date),
                        attendances__status__in=['present', 'late']
                    ),
                    distinct=True
                ),
            )
            .annotate(
                attendance_percentage=Case(
                    When(
                        total_sessions=0,
                        then=Value(0.0)
                    ),
                    default=ExpressionWrapper(
                        100.0 * F('present_count') / F('total_sessions'),
                        output_field=FloatField()
                    ),
                    output_field=FloatField()
                )
            )
        )

# ویو های مربی
#نمایش لیست تمام ثبت نامی های هر کلاس
class EnrollmentListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]
    serializer_class = EnrollmentListSerializer

    def get_queryset(self):
        user = self.request.user

        if user.roles.filter(name='manager').exists():
            return Enrollment.objects.select_related(
                'student', 'course'
            ).order_by('-joined_at')

        if user.roles.filter(name='coach').exists():
            return Enrollment.objects.filter(
                course__coach=user
            ).select_related(
                'student', 'course'
            ).order_by('-joined_at')

        raise PermissionDenied('شما دسترسی به این بخش را ندارید')

#نمایش جداول زمانی یک کلاس
class TimeTableListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]
    serializer_class = TimeTableSerializer

    def get_queryset(self):
        user = self.request.user

        queryset = TimeTable.objects.select_related('course')

        if user.roles.filter(name='manager').exists():
            return queryset.order_by('day_of_week', 'start_time')

        if user.roles.filter(name='coach').exists():
            return queryset.filter(
                course__coach=user
            ).order_by('day_of_week', 'start_time')

        raise PermissionDenied('شما دسترسی به این بخش را ندارید')

# این ویو جهت نمایش تعداد کلاس های یک شخص میباشد
class UserCoursesCount(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = self.request.user

        if user.roles.filter(name='manager').exists():
            count = Course.objects.all().count()
        
        if user.roles.filter(name='coach').exists():
            count = Course.objects.filter(coach = user).count()
        
        if user.roles.filter(name='athlete').exists():
            count = Enrollment.objects.filter(student = user).count()
        
        return Response({"courses": count})

#این ویو جهت نمایش داخل بخش پروفایل میباشد برای مدیر یا مربی
class StudentCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = self.request.user

        if user.roles.filter(name='manager').exists():
            count = Enrollment.objects.count()
        elif user.roles.filter(name='coach').exists():
            count = Enrollment.objects.filter(course__coach=user, status='active').count()
        else:
            count = 0

        return Response({"students": count})



# ویو های ورزشکار
#لیست کلاس های یک ورزشکار
class UserEnrollmentsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserEnrollmnetsSerializers

    def get_queryset(self):
        return (
            Enrollment.objects
            .filter(student=self.request.user)
            .select_related('course')
            .prefetch_related(
                'course__timeTable__sessions'
            )
        )


#لیست جلسات یک کلاس ورزشکار
class ThisMonthSessionView(ListAPIView):
    serializer_class = SessionSerializer

    def get_queryset(self):
        course = get_object_or_404(Course, id=self.kwargs['course_id'])
        start_date, end_date = get_current_shamsi_month_range()

        return Session.objects.filter(
            time_table__course=course,
            date__range=(start_date, end_date)
        ).order_by('date')


class UserMonthSessionView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SessionSerializer

    def get_queryset(self):
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')

        if not year or not month:
            return Session.objects.none()

        year = int(year)
        month = int(month)

        start_date, end_date = get_shamsi_month_range(year, month)

        user = self.request.user

        return (
            Session.objects
            .filter(
                time_table__course__enrollments__student=user,
                time_table__course__enrollments__status='active',
                date__range=(start_date, end_date)
            )
            .select_related('time_table__course')
            .prefetch_related(
                Prefetch(
                    'attendances',
                    queryset=Attendance.objects.filter(student__student=user),
                    to_attr='user_attendance'
                )
            )
            .order_by('date')
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            'count': queryset.count(),
            'sessions': serializer.data
        })


class UserNextSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = datetime.date.today()

        session = (
            Session.objects
            .filter(
                time_table__course__enrollments__student=request.user,
                date__gte=today,
                time_table__course__enrollments__status='active'
            )
            .select_related('time_table__course')
            .order_by('date')
            .first()
        )

        if not session:
            return Response({'next_session': None})
    

        return Response({
            'next_session': {
                'session_id': session.id,
                'date': session.date,
                'date_jalali': jdatetime.datetime.fromgregorian(datetime=session.date).strftime("%Y/%m/%d"),
                'day_of_week': session.time_table.get_day_of_week_display(),
                'start_time': session.time_table.start_time,
                'end_time': session.time_table.end_time,
                'course': {
                    'id': session.time_table.course.id,
                    'title': session.time_table.course.title,
                    'age_ranges': AgeRangeSerializers(
                        session.time_table.course.age_ranges.all(),
                        many=True
                    ).data
                }
            }
        })


class UserPreviousMonthSessionsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PrevMonthSessionSerializer

    def get_queryset(self):
        return (
            Enrollment.objects
            .filter(student=self.request.user)
            .select_related('course')
            .prefetch_related(
                'course__timeTable__sessions'
            )
        )



# حضور و غیاب
# این ویو واسه مربیه و جلسه هایی از کلاس رو میبینه که گذشته
class AvailableMonthSessionView(ListAPIView):
    serializer_class = SessionSerializer

    def get_queryset(self):

        course = get_object_or_404(
            Course,
            id=self.kwargs['course_id']
        )

        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")

        # اگر نفرستادن → ماه جاری
        if not year or not month:
            today_shamsi = jdatetime.date.today()
            year = today_shamsi.year
            month = today_shamsi.month
        else:
            year = int(year)
            month = int(month)

        # اول ماه شمسی
        start_shamsi = jdatetime.date(year, month, 1)

        # ماه بعد برای محاسبه بازه
        if month == 12:
            end_shamsi = jdatetime.date(year + 1, 1, 1)
        else:
            end_shamsi = jdatetime.date(year, month + 1, 1)

        # تبدیل به میلادی
        start_date = start_shamsi.togregorian()
        end_date = end_shamsi.togregorian()

        qs = Session.objects.filter(
            time_table__course=course,
            date__gte=start_date,
            date__lt=end_date
        )

        # برای ماه جاری فقط جلسات گذشته یا امروز نمایش داده شوند
        today_gregorian = timezone.localdate()
        today_shamsi = jdatetime.date.fromgregorian(date=today_gregorian)

        if year == today_shamsi.year and month == today_shamsi.month:
            qs = qs.filter(date__lte=today_gregorian)

        return qs.order_by('-date')




# این ویو واسه مربیه و حضور غیاب هایی که از قبل انجام شده است رو میبینه
class SessionAttendance(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SessionAttendanceSerializers

    def get_queryset(self):
        session_id = self.kwargs['session_id']

        today_gregorian = timezone.now().date()

        # تبدیل امروز به شمسی
        today_shamsi = jdatetime.date.fromgregorian(date=today_gregorian)

        # اول ماه شمسی
        start_shamsi = jdatetime.date(today_shamsi.year, today_shamsi.month, 1)

        # تبدیل به میلادی
        start_date = start_shamsi.togregorian()

        return Attendance.objects.filter(
            session_id=session_id
        ).select_related('student', 'student__student', 'session')

# این ویو برای مربی ایجاد شده است و حضور و غیاب هر جلسه را انجام میدهد.
class AttendanceBulkUpdateView(APIView):

    @transaction.atomic
    def put(self, request, session_id):

        serializer = AttendanceBulkUpdateSerializer(
            data=request.data,
            many=True
        )
        serializer.is_valid(raise_exception=True)

        updates = serializer.validated_data

        # گرفتن همه attendance های این session
        attendances = Attendance.objects.filter(
            session_id=session_id
        )

        attendance_map = {
            a.student_id: a for a in attendances
        }

        for item in updates:
            student_id = item['student']
            new_status = item['status']

            if student_id in attendance_map:
                attendance = attendance_map[student_id]
                attendance.status = new_status

                # اگر note فرستاده شد آپدیتش کن
                if 'note' in item:
                    attendance.note = item['note']

        Attendance.objects.bulk_update(
            attendance_map.values(),
            ['status', 'note']
        )

        Session.objects.filter(id=session_id).update(
            attendance_status='finished'
        )

        return Response({"message": "Attendance updated successfully"})


#ویو برای ورزشکار واسه دیدن گزارش حضور و غیابش


class StudentCourseMonthlySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):

        enrollment = get_object_or_404(
            Enrollment,
            student=request.user,
            course_id=course_id,
            status='active'
        )

        sessions = (
            Session.objects
            .filter(
                time_table__course_id=course_id,
                attendance_status='finished'
            )
            .prefetch_related(
                Prefetch(
                    'attendances',
                    queryset=Attendance.objects.filter(student=enrollment)
                )
            )
        )

        monthly_data = defaultdict(lambda: {
            "year": None,
            "month": None,
            "month_name": "",
            "total_sessions": 0,
            "present_count": 0,
        })

        for session in sessions:

            jalali = jdatetime.date.fromgregorian(date=session.date)
            key = (jalali.year, jalali.month)

            monthly_data[key]["year"] = jalali.year
            monthly_data[key]["month"] = jalali.month
            monthly_data[key]["month_name"] = f"{PERSIAN_MONTHS[jalali.month]} {jalali.year}"
            monthly_data[key]["total_sessions"] += 1

            attendance = session.attendances.first()
            if attendance and attendance.status in ["present", "late"]:
                monthly_data[key]["present_count"] += 1

        result = []

        for data in monthly_data.values():

            total = data["total_sessions"]
            present = data["present_count"]

            percentage = round((present / total) * 100, 1) if total > 0 else 0
            if percentage >= (84):
                percentage_status = 'excellent'
            elif 60 <= percentage < 84:
                percentage_status = 'good'
            elif percentage < 60:
                percentage_status = 'low'
            else:
                percentage_status = '' 
            
            data["attendance_percentage"] = percentage
            data["attendance_percentage_status"] = percentage_status
            result.append(data)

        # 🔥 جدیدترین ماه اول
        result.sort(key=lambda x: (x["year"], x["month"]), reverse=True)

        serializer = MonthlyAttendanceSummarySerializer(result, many=True)

        return Response({
            "course_id": course_id,
            "months": serializer.data
        })



class AthleteDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        # گرفتن ماه و سال از query params
        year = request.query_params.get("year")
        month = request.query_params.get("month")

        # اگر نفرستاده بود، ماه جاری
        if not year or not month:
            today_jalali = jdatetime.date.today()
            year = today_jalali.year
            month = today_jalali.month
        else:
            year = int(year)
            month = int(month)

        # تبدیل بازه ماه شمسی به میلادی
        start_jalali = jdatetime.date(year, month, 1)
        if month == 12:
            end_jalali = jdatetime.date(year + 1, 1, 1)
        else:
            end_jalali = jdatetime.date(year, month + 1, 1)

        start_date = start_jalali.togregorian()
        end_date = end_jalali.togregorian()

        # محاسبه ماه قبل
        if month == 1:
            prev_year = year - 1
            prev_month = 12
        else:
            prev_year = year
            prev_month = month - 1

        prev_start_jalali = jdatetime.date(prev_year, prev_month, 1)

        if prev_month == 12:
            prev_end_jalali = jdatetime.date(prev_year + 1, 1, 1)
        else:
            prev_end_jalali = jdatetime.date(prev_year, prev_month + 1, 1)

        prev_start_date = prev_start_jalali.togregorian()
        prev_end_date = prev_end_jalali.togregorian()

        # enrollments فعال
        enrollments = Enrollment.objects.filter(
            student=user,
            status='active'
        )

        total_courses = enrollments.count()

        # session های finished در اون ماه برای همه کلاس‌ها
        sessions = Session.objects.filter(
            attendance_status='finished',
            time_table__course__enrollments__in=enrollments,
            date__gte=start_date,
            date__lt=end_date
        ).distinct()

        total_sessions = sessions.count()

        attendances = Attendance.objects.filter(
            student__in=enrollments,
            session__in=sessions
        )

        total_present = attendances.filter(
            status__in=['present', 'late']
        ).count()

        total_absent = attendances.filter(
            status='absent'
        ).count()

        attendance_percentage = (
            round((total_present / total_sessions) * 100, 1)
            if total_sessions > 0 else 0
        )

        remaining_sessions = Session.objects.filter(
            attendance_status='unfinished',
            time_table__course__enrollments__in=enrollments,
            date__gte=start_date,
            date__lt=end_date
        ).distinct().count()

        prev_sessions = Session.objects.filter(
            attendance_status='finished',
            time_table__course__enrollments__in=enrollments,
            date__gte=prev_start_date,
            date__lt=prev_end_date
        ).distinct()

        prev_total_sessions = prev_sessions.count()

        prev_attendances = Attendance.objects.filter(
            student__in=enrollments,
            session__in=prev_sessions,
            status__in=['present', 'late']
        )

        prev_total_present = prev_attendances.count()

        previous_attendance_percentage = (
            round((prev_total_present / prev_total_sessions) * 100, 1)
            if prev_total_sessions > 0 else None
        )

        attendance_difference = None
        trend = None

        if previous_attendance_percentage is not None:
            attendance_difference = round(
                attendance_percentage - previous_attendance_percentage,
                1
            )

            if attendance_difference > 0:
                trend = "up"
            elif attendance_difference < 0:
                trend = "down"
            else:
                trend = "same"

        data = {
            "year": year,
            "month": month,
            "month_name": f"{PERSIAN_MONTHS[month]} {year}",

            "total_courses": total_courses,
            "total_sessions": total_sessions,
            "total_present": total_present,
            "total_absent": total_absent,
            "remaining_sessions": remaining_sessions,

            "attendance_percentage": attendance_percentage,

            "previous_attendance_percentage": previous_attendance_percentage,
            "attendance_difference": attendance_difference,
            "trend": trend,
        }

        serializer = AthleteDashboardSerializer(data)

        return Response(serializer.data)
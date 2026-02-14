from django.shortcuts import render, get_object_or_404
from django.core.exceptions import PermissionDenied
from django.db.models import Prefetch, Count
import datetime
import jdatetime

from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from account.permissions import IsCoachOrManager

from account.models import CustomUser
from .models import Course, Enrollment, TimeTable, Session, Attendance
from .utils import get_current_shamsi_month_range, get_previous_shamsi_month_range, get_shamsi_month_range
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
    PrevMonthSessionSerializer,
    SessionAttendanceSerializers,
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

        if user.role == 'manager':
            return queryset

        if user.role == 'coach':
            return queryset.filter(coach=user)

        raise PermissionDenied('شما دسترسی به این بخش را ندارید')

#نمایش اطلاعات کلاس به مدیر و مربی
class CoursesDetailView(RetrieveAPIView):
    queryset = Course.objects.all()
    permission_classes = [IsAuthenticated, IsCoachOrManager]
    serializer_class = CoursesDetailSerializers
    lookup_field = 'id'

#نمایش لیست همه‌ی کاربر ها به مدیر و نمایش لیست هر شخص ثبت نام شده به مربی
class AthleteListView(ListAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated, IsCoachOrManager]

    def get_queryset(self):
        user = self.request.user

        # مدیر → همه کاربران
        if user.is_staff or user.role == 'manager':
            return CustomUser.objects.filter(is_active=True)

        # مربی → فقط کسانی که خودش ثبت‌نام کرده
        if user.role == 'coach':
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
        return Enrollment.objects.filter(
            course_id=course_id,
            status='active'
        ).select_related('student')

#نمایش لیست تمام ثبت نامی ها
class EnrollmentListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]
    serializer_class = EnrollmentListSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == 'manager':
            return Enrollment.objects.select_related(
                'student', 'course'
            ).order_by('-joined_at')

        if user.role == 'coach':
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

        if user.role == 'manager':
            return queryset.order_by('day_of_week', 'start_time')

        if user.role == 'coach':
            return queryset.filter(
                course__coach=user
            ).order_by('day_of_week', 'start_time')

        raise PermissionDenied('شما دسترسی به این بخش را ندارید')

# این ویو جهت نمایش تعداد کلاس های یک شخص میباشد
class UserCoursesCount(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = self.request.user

        if user.role == 'manager':
            count = Course.objects.all().count()
        
        if user.role == 'coach':
            count = Course.objects.filter(coach = user).count()
        
        if user.role == 'athlete':
            count = Enrollment.objects.filter(student = user).count()
        
        return Response({"courses": count})

#این ویو جهت نمایش داخل بخش پروفایل میباشد برای مدیر یا مربی
class StudentCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = self.request.user

        if user.role == 'manager':
            count = Enrollment.objects.all().count()

        if user.role == 'coach':
            count = Enrollment.objects.filter(course__coach=user,status='active')

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

        return (
            Session.objects
            .filter(
                time_table__course__enrollments__student=self.request.user,
                time_table__course__enrollments__status='active',
                date__range=(start_date, end_date)
            )
            .select_related('time_table__course')
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

class SessionAttendance(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SessionAttendanceSerializers

    def get_queryset(self):
        session_id = self.kwargs['session_id']
        return Attendance.objects.filter(
            session_id=session_id
        ).select_related('student', 'session')
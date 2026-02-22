from django.urls import path
from .views import (
            CoursesListView,
            AddEnrollmentView,
            EnrollmentListView,
            UserCoursesCount,
            StudentCountView,
            CoursesDetailView,
            CoursesEnrollmentsView,
            AthleteListView,
            UserEnrollmentsView, 
            ThisMonthSessionView,
            UserNextSessionView,
            UserPreviousMonthSessionsView,
            UserMonthSessionView,
            SessionAttendance,
            AvailableMonthSessionView,
            AttendanceBulkUpdateView,
            StudentCourseMonthlySummaryView,
            AthleteDashboardView,
            )

app_name = 'training'

urlpatterns = [
  path('courses/', CoursesListView.as_view(), name='courses-list'),
  path('courses/detail/<int:id>/', CoursesDetailView.as_view(), name='courses-detail'),
  path('courses/detail/<int:course_id>/students/', CoursesEnrollmentsView.as_view(), name='courses-students-list'),
  path('courses/detail/<int:course_id>/sessions/current-month/',ThisMonthSessionView.as_view(), name='course-session' ),
  path('courses/count/', UserCoursesCount.as_view(), name='courses-count'),
  path('courses/students/count/', StudentCountView.as_view(), name='student-count'),

  path('enrollment/', EnrollmentListView.as_view(), name='enrollment-list'),
  path('enrollment/add/', AddEnrollmentView.as_view(), name='add-enrollment'),

  path('athletes/', AthleteListView.as_view(), name='athlete-list'),
  
  path('my-classes/', UserEnrollmentsView.as_view(), name='my-classes-view'),
  path('my-classes/next-session/', UserNextSessionView.as_view(), name='user-next-session'),
  # path('my-classes/last-month/', UserPreviousMonthSessionsView.as_view(), name='user-last_month-session'),
  path('my-classes/sessions/', UserMonthSessionView.as_view(), name='user-month-session'),
  path('my-classes/<int:course_id>/sessions/attendance-status/', StudentCourseMonthlySummaryView.as_view(), name='user-sessions-attendnace-status'),
  path('my-classes/info/', AthleteDashboardView.as_view(), name='my-classes-info'),

  path('session/<int:session_id>/attendance/',SessionAttendance.as_view(), name='session-attendance'),
  path('session/<int:course_id>/',AvailableMonthSessionView.as_view(), name='available-session'),
  path('session/<int:session_id>/attendance/bulk/',AttendanceBulkUpdateView.as_view(), name='session-bulk')
]
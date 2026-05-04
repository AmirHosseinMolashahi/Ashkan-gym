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
            AthleteDashboardView,
            UserMonthSessionView,
            StudentCourseMonthlySummaryView,
            SessionAttendance,
            AvailableMonthSessionView,
            AttendanceBulkUpdateView,
            ThisMonthSessionView,
            CourseCreateView,
            CourseFormOptionsView,
            TimeTableBulkCreateView,
            TimeTableUpdateView,
            CourseUpdateView,
            CourseDeleteView,
            CoachDashboardCourses,
            DeactivateEnrollmentView,
            ReactivateEnrollmentView,
            UserEnrollmentAttendanceView,
            UserEnrollmentsView,
            )

app_name = 'training'

urlpatterns = [
  # coach and manager urls
  path('courses/', CoursesListView.as_view(), name='courses-list'),
  path('courses/detail/<int:id>/', CoursesDetailView.as_view(), name='courses-detail'),
  path('courses/detail/<int:course_id>/students/', CoursesEnrollmentsView.as_view(), name='courses-students-list'),
  path('courses/detail/<int:course_id>/sessions/current-month/',ThisMonthSessionView.as_view(), name='course-session' ),
  path('courses/count/', UserCoursesCount.as_view(), name='courses-count'),
  path('courses/students/count/', StudentCountView.as_view(), name='student-count'),
  path("courses/form-options/", CourseFormOptionsView.as_view(), name="course-form-options"),
  path("courses/add/", CourseCreateView.as_view(), name="course-add"),
  path("courses/<int:course_id>/timetable/bulk-create/", TimeTableBulkCreateView.as_view(), name="course-add-time-table"),
  path("courses/<int:course_id>/timetable/update/", TimeTableUpdateView.as_view(), name="timetable-update"),
  path("courses/<int:id>/edit/", CourseUpdateView.as_view(), name='course-update'),
  path("courses/<int:id>/delete/", CourseDeleteView.as_view(), name='course-delete'),
  path("courses/dashboard/", CoachDashboardCourses.as_view(), name='courses-dashboard'),

  path("courses/enrollment/<int:enrollment_id>/deactive/", DeactivateEnrollmentView.as_view(), name='enrollment-deactive'),
  path("courses/enrollment/<int:enrollment_id>/reactive/", ReactivateEnrollmentView.as_view(), name='enrollment-reactive'),


  path('enrollment/', EnrollmentListView.as_view(), name='enrollment-list'),
  path('enrollment/add/', AddEnrollmentView.as_view(), name='add-enrollment'),

  path('athletes/', AthleteListView.as_view(), name='athlete-list'),
  

  # athlete urls
  path('my-classes/', UserEnrollmentsView.as_view(), name='athlete-classes'),
  path('my-classes/dashboard/', AthleteDashboardView.as_view(), name='athlete-dashboard'),
  path('my-classes/sessions/', UserMonthSessionView.as_view(), name='user-month-session'),
  path('my-classes/attendance/', UserEnrollmentAttendanceView.as_view(), name='user-attendance'),
  path('my-classes/<int:course_id>/sessions/attendance-status/', StudentCourseMonthlySummaryView.as_view(), name='user-sessions-attendnace-status'),

  path('session/<int:session_id>/attendance/',SessionAttendance.as_view(), name='session-attendance'),
  path('session/<int:course_id>/',AvailableMonthSessionView.as_view(), name='available-session'),
  path('session/<int:session_id>/attendance/bulk/',AttendanceBulkUpdateView.as_view(), name='session-bulk')
]
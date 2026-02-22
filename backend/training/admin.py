from django.contrib import admin, messages
from .models import Course, Enrollment, TimeTable, Session, Attendance, AgeRange
from .utils import generate_shamsi_month_sessions, generate_shamsi_month_attendances
from django.urls import path
from django.shortcuts import redirect

# Register your models here.

class CourseAdmin(admin.ModelAdmin):
    model = Course
    list_display = ['title', 'coach', 'gender', 'get_age_ranges','class_status', 'is_active' ]

    def get_age_ranges(self, obj):
        return ", ".join([str(age) for age in obj.age_ranges.all()])  # یا هر فیلدی که میخوای
    get_age_ranges.short_description = 'رده سنی'

admin.site.register(Course, CourseAdmin)


class EnrollmentAdmin(admin.ModelAdmin):
    model = Enrollment
    list_display = ['student', 'course']

admin.site.register(Enrollment, EnrollmentAdmin)

class TimeTableAdmin(admin.ModelAdmin):
    model = TimeTable
    list_display = ['course', 'day_of_week', 'start_time', 'end_time']

admin.site.register(TimeTable, TimeTableAdmin)

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['time_table', 'date']

    actions = ("attendance_status_change",) # Necessary 

    @admin.action(description="پایان همه کلاس ها")
    def attendance_status_change(modeladmin, request, queryset):
        for obj in queryset:
            obj.attendance_status = "finished"
            obj.save()
            messages.success(request, "Successfully")

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'generate-shamsi-month/',
                self.admin_site.admin_view(self.generate_shamsi_month),
                name='generate_shamsi_month_sessions',
            ),
        ]
        return custom_urls + urls

    def generate_shamsi_month(self, request):
        created_count = generate_shamsi_month_sessions()

        self.message_user(
            request,
            f'{created_count} جلسه برای ماه شمسی ساخته شد ✅',
            messages.SUCCESS
        )
        return redirect('..')

class AttendanceAdmin(admin.ModelAdmin):
    model = Attendance
    list_display = ['session', 'student']

    actions = ("status_change",) # Necessary 

    @admin.action(description="Change status")
    def status_change(modeladmin, request, queryset):
        for obj in queryset:
            obj.status = ""
            obj.save()
            messages.success(request, "Successfully")

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'generate-monthly-attendance/',
                self.admin_site.admin_view(self.generate_shamsi_month),
                name='generate_shamsi_month_attendance',
            ),
        ]
        return custom_urls + urls

    def generate_shamsi_month(self, request):
        created_count = generate_shamsi_month_attendances()

        self.message_user(
            request,
            f'{created_count}',
            messages.SUCCESS
        )
        return redirect('..')

admin.site.register(Attendance, AttendanceAdmin)


class AgeRangeAdmin(admin.ModelAdmin):
    model = AgeRange
    list_display = ['title']

admin.site.register(AgeRange, AgeRangeAdmin)
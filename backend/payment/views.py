from urllib import request

from django.shortcuts import get_object_or_404
from django.db.models import Sum, Q, Value, Count, Case, When, F, IntegerField
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.core.exceptions import PermissionDenied, ValidationError
import jdatetime

from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter

from django_filters.rest_framework import DjangoFilterBackend

from account.permissions import IsCoachOrManager
from training.models import Course, Enrollment
from training.paginations import CustomPagination
from .models import Invoice, Payment
from .serializers import (
        StudentInvoiceSerializer,
        CoachInvoiceSerializer,
        AthleteInvoiceSerializer,
        AthletePaymentReportSerializer,
        InvoiceManualUpdateSerializer,
        PaymentMiniSerializer,
        DiscountUpdateSerializer,
    )


class CoachInvoiceListView(ListAPIView):
    """
    لیست صورتحساب‌های یک کلاس (فقط برای مربی/مدیر)
    فیلتر بر اساس:
      - course_id (ضروری)
      - year (اختیاری، اگر نباشد همه سال‌ها)
      - month (اختیاری، اگر نباشد همه ماه‌ها)
    """
    permission_classes = [IsAuthenticated, IsCoachOrManager]
    serializer_class = StudentInvoiceSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        user = self.request.user
        course_id = self.request.query_params.get("course_id")
        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")

        if not course_id:
            raise ValidationError("ارسال ID کلاس ضروری است.")

        # اطمینان از این‌که مربی واقعاً مربی آن کلاس است
        course = get_object_or_404(Course, id=course_id)
        if not (
            user.roles.filter(name="manager").exists()
            or course.coach == user
        ):
            raise PermissionDenied("شما دسترسی لازم برای این کلاس را ندارید.")

        qs = Invoice.objects.filter(
            enrollment__course_id=course_id
        ).select_related(
            "enrollment__student",
            "enrollment__course",
        ).annotate(
            paid_amount_db=Sum(
                "payments__amount",
                filter=Q(payments__status="success")
            )
        )

        if year:
            qs = qs.filter(period_year=int(year))
        if month:
            qs = qs.filter(period_month=int(month))

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        search = request.query_params.get("search")
        status_filter = request.query_params.get("status")

        course_id = request.query_params.get("course_id")
        course = get_object_or_404(Course, id=course_id)

        if search:
            queryset = queryset.filter(
                Q(enrollment__student__first_name__icontains=search)
                | Q(enrollment__student__last_name__icontains=search)
                | Q(enrollment__student__national_id__icontains=search)
            )

        total_expected = 0
        collected = 0
        pending = 0

        pending_students = set()

        students = []
        
        for inv in queryset:
            final_amount = inv.get_final_amount()
            paid = inv.paid_amount_db or 0
            remaining = max(final_amount - paid, 0)

            status_value = inv.calculate_status()

            if status_filter and status_filter != "all":
                if status_value != status_filter:
                    continue

            total_expected += final_amount
            collected += paid
            pending += remaining

            student = inv.enrollment.student
            student_id = student.id

            def notified_at_jalali(obj):
                if obj.overdue_notified_at:
                    return jdatetime.date.fromgregorian(date=obj.overdue_notified_at).strftime("%Y/%m/%d")
                return None

            if remaining > 0:
                pending_students.add(student_id)

            students.append({
                "student_id": student_id,
                "student_name": student.get_full_name(),
                "student_national_id": student.national_id,
                "profile_picture": request.build_absolute_uri(
                                    student.profile_picture.url
                                ) if student.profile_picture else None,
                
                "inv_id": inv.id,
                "final_amount": final_amount,
                "updated_at": inv.updated_at,
                "due_date": inv.get_final_due_date(),
                "payments": PaymentMiniSerializer(inv.payments.all(), many=True).data,
                "paid_amount": paid,
                "overdue_notified_count": inv.overdue_notified_count,
                "overdue_notified_at": notified_at_jalali(inv),
                "remaining_amount": remaining,
                "status": inv.calculate_status(),
            })
        
        paginator = self.pagination_class()

        paginated_students = paginator.paginate_queryset(
            students,
            request
        )

        return paginator.get_paginated_response({
            "summary": {
                "course_id": course.id,
                "course_title": course.title,
                "students_count": course.enrollments.count(),

                "total_expected": total_expected,
                "collected": collected,
                "pending": pending,

                "pending_count": len(pending_students),
            },
            "students": paginated_students
        })
    
class CoachPaymentDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]

    def get(self, request):
        user = request.user
        year = int(request.query_params.get("year"))
        month = int(request.query_params.get("month"))


        if user.roles.filter(name="manager").exists():
            courses = Course.objects.all()
        elif user.roles.filter(name="coach").exists():
            courses = Course.objects.filter(coach=user)
        else:
            return Response(
                {"detail": "شما به این داشبورد دسترسی ندارید."},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # filters
        gender = request.query_params.get("gender")
        day_group = request.query_params.get("day_group")
        search = request.query_params.get("search")

        if gender and gender != "all":
            courses = courses.filter(gender=gender)

        if day_group and day_group != "all":
            courses = courses.filter(days_group=day_group)

        if search:
            courses = courses.filter(title__icontains=search)


        data = []
        total_expected = 0
        collected = 0
        pending = 0
        overdue = 0
        pending_athletes = 0

        for course in courses:
            enrollments = course.enrollments.all()

            invoices = Invoice.objects.filter(
                enrollment__in=enrollments,
                period_year=year,
                period_month=month
            ).select_related("enrollment")

            course_total = 0
            course_collected = 0
            course_pending = 0

            paid_count = 0
            unpaid_count = 0
            course_pending_amount = 0

            for inv in invoices:
                final_amount = inv.get_final_amount()
                paid = inv.paid_amount()
                remaining = max(final_amount - paid, 0)

                course_total += final_amount
                course_collected += paid
                course_pending += remaining

                if remaining <= 0:
                    paid_count += 1
                else:
                    unpaid_count += 1
                    course_pending_amount += remaining

                    # برای کل سیستم (summary)
                    pending_athletes += 1

                    if inv.get_final_due_date() and inv.get_final_due_date() < timezone.now().date():
                        overdue += remaining
            
            if unpaid_count == 0 and paid_count > 0:
                state = {
                    "label": "همه پرداخت شده",
                    "type": "good"
                }
            elif paid_count > 0:
                state = {
                    "label": "بخشی پرداخت نشده",
                    "type": "warning"
                }
            else:
                state = {
                    "label": "پرداخت نشده",
                    "type": "danger"
                }
            
            has_overdue = any(
                inv.get_remaining_amount() > 0 and
                inv.get_final_due_date and
                inv.get_final_due_date() < timezone.now().date()
                for inv in invoices
            )

            if has_overdue:
                state = {"label": "سررسید گذشته", "type": "danger"}
            
            if invoices.count() == 0:
                state = {"label": "بدون صورتحساب", "type": "neutral"}
        
            total_expected += course_total
            collected += course_collected
            pending += course_pending

            def get_schedule(obj):
                tables = obj.timeTable.all()

                if not tables:
                    return None

                # روزها
                days = [t.get_day_of_week_display() for t in tables]

                # فرض: ساعت‌ها یکی هستن
                start_time = tables[0].start_time.strftime('%H:%M')
                end_time = tables[0].end_time.strftime('%H:%M')

                return f"{' و '.join(days)} {start_time}–{end_time}"

            data.append({
                "id": course.id,
                "title": course.title,
                "active": course.is_active,
                "gender": course.gender,
                "timeTable": get_schedule(course),
                "day_group": course.days_group,
                "coach": {"full_name": course.coach.get_full_name()},
                "athletes": enrollments.count(),

                "inv_count": invoices.count(),
                "paid_count": paid_count,
                "unpaid_count": unpaid_count,
                "pending_amount": course_pending_amount,

                "state": state,
            })
        
        paginator = CustomPagination()

        paginated_data = paginator.paginate_queryset(
            data,
            request
        )

        return paginator.get_paginated_response({
            "summary": {
                "total_expected": total_expected,
                "collected": collected,
                "pending": pending,
                "overdue": overdue,
                "collected_percent": round((collected / total_expected) * 100) if total_expected else 0,
                "pending_athletes": pending_athletes,
            },
            "courses": paginated_data
        })


class CoachInvoiceUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]

    def post(self, request, invoice_id):
        user = request.user

        invoice = get_object_or_404(
            Invoice.objects.select_related("enrollment__course"),
            id=invoice_id,
        )

        # دسترسی مربی و مدیر
        if not (
            user.roles.filter(name="manager").exists()
            or invoice.enrollment.course.coach == user
        ):
            raise PermissionDenied("شما دسترسی لازم برای این کلاس را ندارید.")

        # دریافت دیتا
        # try:
        #     amount = int(request.data.get("amount"))
        # except (TypeError, ValueError):
        #     return Response(
        #         {"detail": "amount نامعتبر است."},
        #         status=status.HTTP_400_BAD_REQUEST,
        #     )

        method = request.data.get("payment_method")
        print(method)
        valid_methods = {k for k, _ in Payment.METHOD_CHOICES}
        if method not in valid_methods:
            method = "cash"

        amount = invoice.get_remaining_amount()

        if amount <= 0:
            return Response(
                {"detail": "این فاکتور قبلاً تسویه شده است."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # remaining = invoice.get_final_amount() - invoice.paid_amount()

        # if remaining <= 0:
        #     return Response(
        #         {"detail": "این فاکتور قبلاً تسویه شده است."},
        #         status=status.HTTP_400_BAD_REQUEST,
        #     )

        # if amount > remaining:
        #     amount = remaining

        # ساخت payment
        Payment.objects.create(
            invoice=invoice,
            user=user,
            amount=amount,
            method=method,
            status="success",
            paid_at=timezone.now(),
        )

        # sync status
        invoice.sync_status(save=True)
        invoice.refresh_from_db()

        return Response(
            CoachInvoiceSerializer(invoice).data,
            status=status.HTTP_200_OK
        )


class InvoiceManualUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]

    def put(self, request, invoice_id):
        user = request.user

        invoice = get_object_or_404(
            Invoice.objects.select_related("enrollment__course"),
            id=invoice_id,
        )

        # دسترسی مربی
        if invoice.enrollment.course.coach != user and not user.roles.filter(name="manager").exists():
            return Response(
                {"detail": "شما به این صورت‌حساب دسترسی ندارید."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # فقط فیلدهای مجاز
        allowed_fields = {
            "manual_amount",
            "manual_due_date",
            "manual_reason",
        }

        data = {
            key: value
            for key, value in request.data.items()
            if key in allowed_fields
        }

        serializer = InvoiceManualUpdateSerializer(
            invoice,
            data=data,
            partial=True,
        )

        print('serializers data: ',serializer)  # داده‌های ورودی به serializer
        serializer.is_valid()
        if not serializer.is_valid():
            print(serializer.errors)   # 👈 این مهمه
            return Response(serializer.errors, status=400)
        serializer.save()

        return Response(
            CoachInvoiceSerializer(invoice).data,
            status=status.HTTP_200_OK
        )



class AthleteInvoiceListView(ListAPIView):
    """
    لیست صورتحساب‌های ورزشکار لاگین‌شده.
    فیلترها:
      - course_id (اختیاری)
      - year (اختیاری)
      - month (اختیاری)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AthleteInvoiceSerializer

    def get_queryset(self):
        user = self.request.user
        course_id = self.request.query_params.get("course_id")
        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")

        qs = (
            Invoice.objects
            .select_related(
                "enrollment__course__coach"
            )
            .prefetch_related(
                "payments",
                "enrollment__course__timeTable"
            )
            .filter(enrollment__student=user)
        )

        if course_id:
            qs = qs.filter(enrollment__course_id=course_id)
        if year:
            qs = qs.filter(period_year=int(year))
        if month:
            qs = qs.filter(period_month=int(month))

        return qs.order_by("-period_year", "-period_month", "-created_at")
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)

        # -----------------------------
        # SUMMARY (MONTH TOTALS)
        # -----------------------------
        summary = queryset.aggregate(


            total_invoiced=Coalesce(
                Sum(
                    Case(
                        When(manual_amount__isnull=False, then=F("manual_amount")),
                        default=F("amount"),
                        output_field=IntegerField()
                    )
                ),
                Value(0)
            ),
            
            total_paid=Coalesce(
                Sum(
                    "payments__amount",
                    filter=Q(payments__status="success")
                ),
                Value(0)
            ),
            
            count=Count("id", distinct=True),

            total_paid_count=Count(
                "id",
                filter=Q(status="paid"),
                distinct=True
            ),

            total_remaining_count=Count(
                "id",
                filter=Q(status__in=["unpaid", "partially_paid"]),
                distinct=True
            ),
        )

        summary["total_remaining"] = (
            summary["total_invoiced"] - summary["total_paid"]
        )

        return Response({
            "results": serializer.data,
            "summary": summary
        }, status=status.HTTP_200_OK)


class AthleteInvoiceDetailView(APIView):
    """
    جزئیات یک صورتحساب خاص برای ورزشکار.
    تضمین می‌کند این اینوایس متعلق به همان کاربر است.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, invoice_id):
        invoice = get_object_or_404(
            Invoice.objects.select_related("enrollment__course"),
            id=invoice_id,
            enrollment__student=request.user,
        )
        serializer = AthleteInvoiceSerializer(invoice)
        return Response(serializer.data)

class AthletePaymentListView(ListAPIView):
    """
    گزارش همه پرداخت‌های ورزشکار لاگین‌شده.
    فیلترهای اختیاری:
      - year
      - month
      - course_id
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AthletePaymentReportSerializer

    def get_queryset(self):
        user = self.request.user
        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")
        course_id = self.request.query_params.get("course_id")

        qs = Payment.objects.filter(
            invoice__enrollment__student=user
        ).select_related(
            "invoice__enrollment__course"
        )

        if year:
            qs = qs.filter(invoice__period_year=int(year))
        if month:
            qs = qs.filter(invoice__period_month=int(month))
        if course_id:
            qs = qs.filter(invoice__enrollment__course_id=int(course_id))

        return qs.order_by("-paid_at", "-created_at")

class DiscountUpdateView(RetrieveUpdateAPIView):
    queryset = Enrollment.objects.select_related("pricing", "course", "student")
    serializer_class = DiscountUpdateSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'



class DeletePricingRuleView(APIView):
    permission_classes = [IsAuthenticated, IsCoachOrManager]

    def delete(self, request, enrollment_id):
        enrollment = get_object_or_404(Enrollment, id=enrollment_id)

        pricing = getattr(enrollment, 'pricing', None)

        if not pricing:
            return Response(
                {"detail": "Pricing rule وجود ندارد"},
                status=status.HTTP_404_NOT_FOUND
            )

        pricing.delete()

        return Response(
            {"detail": "Pricing rule با موفقیت حذف شد"},
            status=status.HTTP_204_NO_CONTENT
        )
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from django.utils import timezone

from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from account.permissions import IsCoachOrManager
from training.models import Course
from .models import Invoice, Payment
from .serializers import CoachInvoiceSerializer, AthleteInvoiceSerializer


class CoachInvoiceListView(ListAPIView):
    """
    لیست صورتحساب‌های یک کلاس (فقط برای مربی/مدیر)
    فیلتر بر اساس:
      - course_id (ضروری)
      - year (اختیاری، اگر نباشد همه سال‌ها)
      - month (اختیاری، اگر نباشد همه ماه‌ها)
    """
    permission_classes = [IsAuthenticated, IsCoachOrManager]
    serializer_class = CoachInvoiceSerializer

    def get_queryset(self):
        user = self.request.user
        course_id = self.request.query_params.get("course_id")
        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")

        if not course_id:
            return Invoice.objects.none()

        # اطمینان از این‌که مربی واقعاً مربی آن کلاس است
        course = get_object_or_404(Course, id=course_id)
        if user.role == "coach" and course.coach != user:
            return Invoice.objects.none()

        qs = Invoice.objects.filter(
            enrollment__course_id=course_id
        ).select_related(
            "enrollment__student",
            "enrollment__course",
        )

        if year:
            qs = qs.filter(period_year=int(year))
        if month:
            qs = qs.filter(period_month=int(month))

        return qs.order_by(
            "enrollment__student__first_name",
            "enrollment__student__last_name",
        )


class CoachInvoiceUpdateView(APIView):
    """
    مربی / مدیر بتواند:
      - amount
      - status
      - due_date
    را برای یک Invoice خاص تغییر دهد.
    """

    permission_classes = [IsAuthenticated, IsCoachOrManager]

    def patch(self, request, invoice_id):
        return self._update(request, invoice_id, partial=True)

    def put(self, request, invoice_id):
        return self._update(request, invoice_id, partial=False)

    def _update(self, request, invoice_id, partial):
        user = request.user

        invoice = get_object_or_404(
            Invoice.objects.select_related("enrollment__course"),
            id=invoice_id,
        )

        # مربی فقط اگر مربی همان کلاس باشد
        if user.role == "coach" and invoice.enrollment.course.coach != user:
            return Response(
                {"detail": "شما به این صورت‌حساب دسترسی ندارید."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # داده‌های مخصوص ثبت Payment (جزء فیلدهای Invoice نیستند)
        data = request.data.copy()
        payment_method = data.get("payment_method", "cash")
        payment_amount_raw = data.get("payment_amount")

        if hasattr(data, "pop"):
            data.pop("payment_method", None)
            data.pop("payment_amount", None)

        # وضعیت و مانده قبل از آپدیت
        before_status = invoice.status
        before_remaining = invoice.remaining_amount()

        # آپدیت Invoice
        serializer = CoachInvoiceSerializer(
            invoice,
            data=data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        invoice.refresh_from_db()

        # اگر وضعیت تغییر کرده و به paid/partially_paid رفته، Payment ثبت کن
        valid_methods = {k for k, _ in Payment.METHOD_CHOICES}
        if payment_method not in valid_methods:
            payment_method = "cash"

        status_changed = ("status" in request.data) and (invoice.status != before_status)

        if status_changed and invoice.status in ["paid", "partially_paid"] and before_remaining > 0:
            if invoice.status == "paid":
                pay_amount = before_remaining
            else:
                # partially_paid
                try:
                    pay_amount = int(payment_amount_raw or 0)
                except (TypeError, ValueError):
                    return Response(
                        {"detail": "payment_amount نامعتبر است."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if pay_amount <= 0:
                    return Response(
                        {"detail": "برای پرداخت نیمه، payment_amount لازم است."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if pay_amount > before_remaining:
                    pay_amount = before_remaining

            Payment.objects.create(
                invoice=invoice,
                user=request.user,
                amount=pay_amount,
                method=payment_method,
                status="success",
                paid_at=timezone.now(),
            )

            # وضعیت را از روی پرداخت‌های موفق همگام کن
            invoice.sync_status(save=True)

        # همگام‌سازی نهایی (حتی اگر Payment جدید ثبت نشده باشد)
        invoice.sync_status(save=True)
        invoice.refresh_from_db()

        return Response(CoachInvoiceSerializer(invoice).data, status=status.HTTP_200_OK)



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

        qs = Invoice.objects.filter(
            enrollment__student=user
        ).select_related(
            "enrollment__course",
        )

        if course_id:
            qs = qs.filter(enrollment__course_id=course_id)
        if year:
            qs = qs.filter(period_year=int(year))
        if month:
            qs = qs.filter(period_month=int(month))

        return qs.order_by("-period_year", "-period_month", "-created_at")


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
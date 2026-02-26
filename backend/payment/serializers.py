from django.db.models import Sum
from rest_framework import serializers

from .models import Invoice, Payment
import jdatetime


class PaymentMiniSerializer(serializers.ModelSerializer):
    method_label = serializers.CharField(source="get_method_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    paid_at_jalali = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id",
            "amount",
            "method",
            "method_label",
            "status",
            "status_label",
            "paid_at",
            "paid_at_jalali",
            "created_at",
        ]
        read_only_fields = fields
    
    def get_paid_at_jalali(self, obj):
        if obj.paid_at:
            return jdatetime.datetime.fromgregorian(datetime=obj.paid_at).strftime("%Y/%m/%d %H:%M")
        return None


class AthletePaymentReportSerializer(serializers.ModelSerializer):
    method_label = serializers.CharField(source="get_method_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    invoice_id = serializers.IntegerField(source="invoice.id", read_only=True)
    course_id = serializers.IntegerField(source="invoice.enrollment.course.id", read_only=True)
    course_title = serializers.CharField(source="invoice.enrollment.course.title", read_only=True)
    period_year = serializers.IntegerField(source="invoice.period_year", read_only=True)
    period_month = serializers.IntegerField(source="invoice.period_month", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "invoice_id",
            "course_id",
            "course_title",
            "period_year",
            "period_month",
            "amount",
            "method",
            "method_label",
            "status",
            "status_label",
            "paid_at",
            "created_at",
        ]
        read_only_fields = fields


class CoachInvoiceSerializer(serializers.ModelSerializer):
    # اطلاعات ورزشکار
    student_id = serializers.IntegerField(
        source="enrollment.student.id",
        read_only=True,
    )
    student_name = serializers.CharField(
        source="enrollment.student.get_full_name",
        read_only=True,
    )
    student_national_id = serializers.CharField(
        source="enrollment.student.national_id",
        read_only=True,
    )
    student_profile_picture = serializers.ImageField(
        source="enrollment.student.profile_picture",
        read_only=True,
    )

    # اطلاعات کلاس
    course_id = serializers.IntegerField(
        source="enrollment.course.id",
        read_only=True,
    )
    course_title = serializers.CharField(
        source="enrollment.course.title",
        read_only=True,
    )

    # جمع پرداخت‌ها
    paid_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()

    last_payment_method = serializers.SerializerMethodField()
    last_payment_method_label = serializers.SerializerMethodField()
    last_payment_at = serializers.SerializerMethodField()

    payments = serializers.SerializerMethodField()


    class Meta:
        model = Invoice
        fields = [
            "id",
            "enrollment",
            "period_year",
            "period_month",
            "amount",
            "status",
            "due_date",
            "created_at",
            "updated_at",

            # فیلدهای کمکی
            "student_id",
            "student_name",
            "student_national_id",
            "student_profile_picture",
            "course_id",
            "course_title",
            "paid_amount",
            "remaining_amount",
            "last_payment_method",
            "last_payment_method_label",
            "last_payment_at",
            "payments",
        ]
        read_only_fields = [
            "id",
            "enrollment",
            "created_at",
            "updated_at",
            "student_id",
            "student_name",
            "student_national_id",
            "student_profile_picture",
            "course_id",
            "course_title",
            "paid_amount",
            "remaining_amount",
            "last_payment_method",
            "last_payment_method_label",
            "last_payment_at",
            "payments",
        ]

    def get_paid_amount(self, obj):
        agg = obj.payments.filter(status="success").aggregate(
            total=Sum("amount")
        )
        return agg["total"] or 0

    def get_remaining_amount(self, obj):
        return max(obj.amount - self.get_paid_amount(obj), 0)
    
    def _get_last_success_payment(self, obj):
        return obj.payments.filter(status="success").order_by("-paid_at", "-created_at").first()

    def get_last_payment_method(self, obj):
        p = self._get_last_success_payment(obj)
        return p.method if p else None

    def get_last_payment_method_label(self, obj):
        p = self._get_last_success_payment(obj)
        return p.get_method_display() if p else None

    def get_last_payment_at(self, obj):
        p = self._get_last_success_payment(obj)
        return p.paid_at if p else None
    def get_payments(self, obj):
        if obj.status not in ["paid", "partially_paid"]:
            return []
        qs = obj.payments.filter(status="success").order_by("-paid_at", "-created_at")
        return PaymentMiniSerializer(qs, many=True).data


class AthleteInvoiceSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(
        source="enrollment.course.id",
        read_only=True,
    )
    course_title = serializers.CharField(
        source="enrollment.course.title",
        read_only=True,
    )

    paid_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    payments = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            "id",
            "period_year",
            "period_month",
            "amount",
            "status",
            "due_date",
            "created_at",
            "updated_at",
            "course_id",
            "course_title",
            "paid_amount",
            "remaining_amount",
            "payments",
        ]
        read_only_fields = fields  # ورزشکار فقط می‌بیند

    def get_paid_amount(self, obj):
        agg = obj.payments.filter(status="success").aggregate(
            total=Sum("amount")
        )
        return agg["total"] or 0

    def get_remaining_amount(self, obj):
        return max(obj.amount - self.get_paid_amount(obj), 0)
    
    def get_payments(self, obj):
        if obj.status not in ["paid", "partially_paid"]:
            return []
        qs = obj.payments.filter(status="success").order_by("-paid_at", "-created_at")
        return PaymentMiniSerializer(qs, many=True).data

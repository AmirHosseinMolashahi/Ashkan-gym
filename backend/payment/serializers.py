from django.db.models import Sum
from rest_framework import serializers

from .models import Invoice, Payment, PricingRule
from training.models import Enrollment
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


class StudentInvoiceSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    student_national_id = serializers.IntegerField()
    profile_picture = serializers.ImageField(source="enrollment.student.profile_picture",read_only=True,)


    final_amount = serializers.IntegerField()
    due_date = serializers.DateField()
    payments = serializers.JSONField()
    paid_amount = serializers.IntegerField()
    remaining_amount = serializers.IntegerField()

    status = serializers.CharField()


class CoachInvoiceSerializer(serializers.ModelSerializer):

    student_id = serializers.IntegerField(source="enrollment.student.id", read_only=True)
    student_name = serializers.CharField(source="enrollment.student.get_full_name", read_only=True)
    student_national_id = serializers.CharField(source="enrollment.student.national_id",read_only=True,)

    course_id = serializers.IntegerField(source="enrollment.course.id",read_only=True,)
    course_title = serializers.CharField(source="enrollment.course.title", read_only=True)

    paid_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()

    final_amount = serializers.SerializerMethodField()
    final_due_date = serializers.SerializerMethodField()

    manual_due_date_jalali = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = [
            "amount",
            "due_date",
            "created_at",
            "updated_at",
        ]

    def get_paid_amount(self, obj):
        return obj.paid_amount()

    def get_remaining_amount(self, obj):
        return obj.get_remaining_amount()

    def get_final_amount(self, obj):
        return obj.get_final_amount()

    def get_final_due_date(self, obj):
        return obj.get_final_due_date()

    def get_manual_due_date_jalali(self, obj):
        if obj.manual_due_date:
            return jdatetime.date.fromgregorian(date=obj.manual_due_date).strftime("%Y/%m/%d")
        return None
    
class InvoiceManualUpdateSerializer(serializers.ModelSerializer):
    manual_due_date = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    manual_amount = serializers.IntegerField(required=False, allow_null=True)
    manual_reason = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Invoice
        fields = [
            "manual_amount",
            "manual_due_date",
            "manual_reason",
        ]
        extra_kwargs = {
            'manual_amount': {'required': False},
            'manual_due_date': {'required': False},
            'manual_reason': {'required': False}
         }

    def validate_manual_due_date(self, value):
        if not value:
            return None

        try:
            y, m, d = map(int, value.split('/'))
            return jdatetime.date(y, m, d).togregorian()
        except:
            raise serializers.ValidationError("فرمت تاریخ شمسی نامعتبر است.")

    def update(self, instance, validated_data):
        print("Validated data in serializer update: ", validated_data)  # داده‌های معتبر شده در متد update
        instance.manual_amount = validated_data.get("manual_amount", instance.manual_amount)
        instance.manual_due_date = validated_data.get("manual_due_date", instance.manual_due_date)
        instance.manual_reason = validated_data.get("manual_reason", instance.manual_reason)
        instance.save()
        return instance


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
    final_amount = serializers.SerializerMethodField()
    final_due_date = serializers.SerializerMethodField()

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
            "manual_reason",
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
    
    def get_final_amount(self, obj):
        return obj.get_final_amount()

    def get_final_due_date(self, obj):
        return obj.get_final_due_date()


class DiscountUpdateSerializer(serializers.ModelSerializer):
    # 👇 فیلدهای enrollment
    custom_due_day = serializers.IntegerField(required=False)

    # 👇 فیلدهای pricing
    monthly_fee = serializers.IntegerField(required=False)
    discount_percent = serializers.IntegerField(required=False)
    discount_amount = serializers.IntegerField(required=False)
    discount_reason = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Enrollment
        fields = (
            "custom_due_day",
            "monthly_fee",
            "discount_percent",
            "discount_amount",
            "discount_reason",
        )

    def update(self, instance, validated_data):
        # 👇 enrollment update
        instance.custom_due_day = validated_data.get(
            "custom_due_day",
            instance.custom_due_day
        )
        instance.save()

        # 👇 pricing update
        pricing_fields = {"monthly_fee", "discount_percent", "discount_amount", "discount_reason"}

        if pricing_fields & validated_data.keys():
            pricing, created = PricingRule.objects.get_or_create(enrollment=instance)

            if "monthly_fee" in validated_data:
                pricing.monthly_fee = validated_data["monthly_fee"]

            if "discount_percent" in validated_data:
                pricing.discount_percent = validated_data["discount_percent"]

            if "discount_amount" in validated_data:
                pricing.discount_amount = validated_data["discount_amount"]

            if "discount_reason" in validated_data:
                pricing.reason = validated_data["discount_reason"]

            pricing.save()

        return instance
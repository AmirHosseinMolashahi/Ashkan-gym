from rest_framework import serializers
from .models import Announcements, AnnouncementRecipient
from account.models import CustomUser
import jdatetime
import datetime
import json


class RecipientsListField(serializers.Field):
    def to_internal_value(self, data):
        # اگر رشته JSON است، تبدیل کنیم
        if isinstance(data, str):
            import json
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                # اگر JSON نبود، فرض می‌کنیم رشته‌ای جدا شده با کاما است
                data = [x.strip() for x in data.split(',') if x.strip()]

        # اگر لیست هست، همه را int کنیم
        if isinstance(data, list):
            new_list = []
            for item in data:
                try:
                    new_list.append(int(item))
                except Exception:
                    raise serializers.ValidationError(
                        "هر آیتم recipients باید عدد باشد."
                    )
            return new_list

        raise serializers.ValidationError("فرمت recipients نامعتبر است.")

    def to_representation(self, value):
        # برای خروجی، همان لیست PKها را برگردانیم
        return [obj.pk if hasattr(obj, 'pk') else int(obj) for obj in value]


class AnnounceCreateSerializer(serializers.ModelSerializer):
    time = serializers.CharField(required=False, allow_null=True)
    recipients = RecipientsListField(write_only=True)
    
    class Meta:
        model = Announcements
        fields = ['title','descriptions','status','time','recipients']
    
    def validate_time(self, value):
        if not value:
            return None

        try:
            # value: "1403/11/15 14:30"
            date_part, time_part = value.split(' ')

            j_y, j_m, j_d = map(int, date_part.split('/'))
            hour, minute = map(int, time_part.split(':'))

            # تبدیل شمسی → میلادی
            g_date = jdatetime.date(j_y, j_m, j_d).togregorian()

            # ساخت datetime میلادی کامل
            g_datetime = datetime.datetime(
                g_date.year,
                g_date.month,
                g_date.day,
                hour,
                minute
            )

            return g_datetime

        except Exception:
            raise serializers.ValidationError("فرمت تاریخ/ساعت نامعتبر است.")
    
    
    
    def create(self, validated_data):
        recipients = validated_data.pop('recipients', [])
        announcement = super().create(validated_data)
        announcement.recipients.set(recipients)
        return announcement

    
    
class AnnounceUpdateSerializer(serializers.ModelSerializer):
    time = serializers.CharField(required=False, allow_null=True)
    time_jalali = serializers.SerializerMethodField()
    recipients = RecipientsListField(write_only=True)
    recipients_ids = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Announcements
        fields = ['title','descriptions','status','time', 'time_jalali','recipients', 'recipients_ids']

    def get_time_jalali(self, obj):
        if obj.time:
            return jdatetime.datetime.fromgregorian(datetime=obj.time).strftime("%Y/%m/%d %H:%M")
        return None
    
    def validate_time(self, value):
        if not value:
            return None

        try:
            # value: "1403/11/15 14:30"
            date_part, time_part = value.split(' ')

            j_y, j_m, j_d = map(int, date_part.split('/'))
            hour, minute = map(int, time_part.split(':'))

            # تبدیل شمسی → میلادی
            g_date = jdatetime.date(j_y, j_m, j_d).togregorian()

            # ساخت datetime میلادی کامل
            g_datetime = datetime.datetime(
                g_date.year,
                g_date.month,
                g_date.day,
                hour,
                minute
            )

            return g_datetime

        except Exception:
            raise serializers.ValidationError("فرمت تاریخ/ساعت نامعتبر است.")
    
    def get_recipients_ids(self, obj):
        return list(obj.recipients.values_list("id", flat=True))
        
    def update(self, instance, validated_data):
        recipients_data = validated_data.pop('recipients', None)
        announcement = super().update(instance, validated_data)
        if recipients_data is not None:
            announcement.recipients.set(recipients_data)
        return announcement
    


class RecipientStatusSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name')

    class Meta:
        model = AnnouncementRecipient
        fields = ['user', 'full_name', 'is_read']

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    class Meta:
        model = CustomUser
        fields = ('id', 'full_name')
    
    def get_full_name(self, obj):
        return obj.get_full_name()  # call the model method

class AnnounceSerializer(serializers.ModelSerializer):
    status_label = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)
    time_jalali = serializers.SerializerMethodField()
    recipients_count = serializers.CharField(source='recipients.count', read_only=True)
    recipients_status = serializers.SerializerMethodField()

    class Meta:
        model = Announcements
        fields = '__all__'

    def get_status_label(self, obj):
        labels = {
            'p': 'منتشر شده',
            'b': 'بازگردانی شده',
            'd': 'پیش‌نویس',
            'r': 'در انتظار بررسی',
        }
        return labels.get(obj.status, obj.status)
    
    def get_time_jalali(self, obj):
        if obj.time:
            return jdatetime.datetime.fromgregorian(datetime=obj.time).strftime("%Y/%m/%d %H:%M")
        return None

    def get_recipients_status(self, obj):
        recipients = AnnouncementRecipient.objects.filter(announcement=obj)
        return RecipientStatusSerializer(recipients, many=True).data

class AnnounceLimitedSerializer(serializers.ModelSerializer):
    time_jalali = serializers.SerializerMethodField()
    is_new = serializers.SerializerMethodField()


    class Meta:
        model = Announcements
        fields = ['id','title', 'descriptions', 'time_jalali', 'is_new']
    
    def get_time_jalali(self, obj):
        if obj.time:
            return jdatetime.datetime.fromgregorian(datetime=obj.time).strftime("%Y/%m/%d %H:%M")
        return None

    def get_is_new(self, obj):
        user = self.context['request'].user
        try:
            recipient = obj.announcementrecipient_set.get(user=user)
            return not recipient.is_read
        except AnnouncementRecipient.DoesNotExist:
            return False
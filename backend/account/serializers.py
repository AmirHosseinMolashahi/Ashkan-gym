from rest_framework import serializers
from .models import CustomUser
import jdatetime
from registration.models import Registration
from django.db import transaction
from notifications.utils import create_and_send_notification

from jalali_date import datetime2jalali


class userSerializers(serializers.ModelSerializer):
    gender_title = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    previous_login_jalali = serializers.SerializerMethodField()
    birthdate_jalali = serializers.SerializerMethodField()
    joined_at = serializers.SerializerMethodField()
    

    class Meta:
        model = CustomUser
        fields = '__all__'

    def get_gender_title(self, obj):
        return obj.gender_title()  # call the model method
    
    def get_full_name(self, obj):
        return obj.get_full_name()  # call the model method
    
    def get_previous_login_jalali(self, obj):
        if obj.previous_login:
            return jdatetime.datetime.fromgregorian(datetime=obj.last_login).strftime("%Y/%m/%d %H:%M")
        return None
    def get_birthdate_jalali(self, obj):
        if obj.birthdate:
            return jdatetime.datetime.fromgregorian(datetime=obj.birthdate).strftime("%Y/%m/%d")
        return None
    
    def get_joined_at(self, obj):
        if obj.date_joined:
            return jdatetime.datetime.fromgregorian(datetime=obj.date_joined).strftime("%Y/%m/%d %H:%M")
        return None
    

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'national_id', 'first_name', 'last_name', 'phone_number', 'password', 'confirm_password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        # بررسی مطابقت رمز عبور و تایید آن
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "رمز عبور و تکرار آن یکسان نیست!"})
        return attrs

    def create(self, validated_data):
        # حذف confirm_password قبل از ایجاد کاربر
        validated_data.pop('confirm_password', None)
        with transaction.atomic():
            created_by = self.context['request'].user  
            # 1. ساخت کاربر
            user = CustomUser.objects.create_user(**validated_data)

            # 2. ساخت ثبت‌نام (Registration) اولیه
            Registration.objects.create(
                user=user,
                created_by=created_by,
                current_step=1,
                status='draft'
            )

            #ارسال نوتیف
            create_and_send_notification(
                user=user,
                title=f"ثبت نام اولیه شما با موفقیت انجام شد.",
                message=f"ثبت نام اولیه شما با موفقیت انجام شد. با رفتن به بخش پروفایل میتوانید وضعیت ثبت نام خود را چک کنید.",
                type="info",
                category="registration",
            )

        return user
    
    

class UserUpdateSerializer(serializers.ModelSerializer):
    birthdate = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    national_id = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id','full_name','national_id','first_name', 'last_name', 'email', 'phone_number','birthdate', 'address', 'profile_picture', 'father_name', 'gender']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': False},
            'phone_number': {'required': False},
            'birthdate': {'required': False},
            'address': {'required': False},
            'profile_picture': {'required': False},
            'father_name': {'required': False},
            'gender': {'required': False},
        }
    
    def validate_birthdate(self, value):
        if not value:
            return None

        try:
            print(value)
            y, m, d = map(int, value.split('/'))
            gregorian_date = jdatetime.date(y, m, d).togregorian()
            print(gregorian_date)
            return gregorian_date
        except:
            raise serializers.ValidationError("فرمت تاریخ شمسی نامعتبر است.")
    
    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_national_id(self, obj):
        return obj.national_id
    # def update(self, instance, validated_data):
    #     # اگر birth_date در validated_data وجود دارد، اینجا دیگر میلادی شده
    #     return super().update(instance, validated_data)

# class coachSerializers(serializers.ModelSerializer):
#     user = userSerializers()

#     class Meta:
#         model = Coach
#         fields = ['id', 'is_active', 'account', 'user']


# class coachUpdateSerializers(serializers.ModelSerializer):
#     # آیدی کاربر برای نوشتن
#     user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
#     # نمایش اطلاعات کامل کاربر در GET
#     user_detail = userSerializers(source='user', read_only=True)

#     class Meta:
#         model = Coach
#         fields = ['id', 'is_active', 'user', 'user_detail']
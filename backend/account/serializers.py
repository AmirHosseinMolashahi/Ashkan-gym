from rest_framework import serializers
from .models import CustomUser
import jdatetime

from jalali_date import datetime2jalali


class userSerializers(serializers.ModelSerializer):
    gender_title = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    previous_login_jalali = serializers.SerializerMethodField()
    birthdate_jalali = serializers.SerializerMethodField()
    

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
        return jdatetime.datetime.fromgregorian(datetime=obj.birthdate).strftime("%Y/%m/%d")
    

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['national_id', 'password', 'father_name', 'gender']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)  # پسورد هش می‌شه
    

class UserUpdateSerializer(serializers.ModelSerializer):
    birthdate = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'phone_number','birthdate', 'address', 'profile_picture']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': False},
            'phone_number': {'required': False},
            'birthdate': {'required': False},
            'address': {'required': False},
            'profile_picture': {'required': False},
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
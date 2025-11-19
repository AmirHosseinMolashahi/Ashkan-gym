from rest_framework import serializers
from .models import CustomUser, Coach

class userSerializers(serializers.ModelSerializer):
    gender_title = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = '__all__'

    def get_gender_title(self, obj):
        return obj.gender_title()  # call the model method
    
    def get_full_name(self, obj):
        return obj.get_full_name()  # call the model method

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['national_id', 'password', 'father_name', 'gender']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)  # پسورد هش می‌شه
    

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'phone_number','birthdate','address', 'profile_picture']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': False},
            'phone_number': {'required': False},
            'birthdate': {'required': False},
            'address': {'required': False},
            'profile_picture': {'required': False},
        }

class coachSerializers(serializers.ModelSerializer):
    user = userSerializers()

    class Meta:
        model = Coach
        fields = ['id', 'is_active', 'account', 'user']


class coachUpdateSerializers(serializers.ModelSerializer):
    # آیدی کاربر برای نوشتن
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    # نمایش اطلاعات کامل کاربر در GET
    user_detail = userSerializers(source='user', read_only=True)

    class Meta:
        model = Coach
        fields = ['id', 'is_active', 'user', 'user_detail']
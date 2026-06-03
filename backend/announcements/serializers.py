from rest_framework import serializers
from .models import Announcement, AnnouncementRead
from account.models import CustomUser, Role
from training.models import Course
import jdatetime
import datetime
from account.serializers import RoleListSerializer
from training.serializers import CourseMiniSerializer

class AnnounceCreateSerializer(serializers.ModelSerializer):
    
    target_roles = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        many=True,
        required=False
    )

    target_classes = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        many=True,
        required=False
    )

    target_users = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        many=True,
        required=False
    )

    class Meta:
        model = Announcement
        fields = [
            'title',
            'descriptions',
            'status',
            'is_global',
            'target_roles',
            'target_classes',
            'target_users',
        ]
    

    def validate(self, attrs):

        is_global = attrs.get('is_global', False)

        target_roles = attrs.get('target_roles')
        target_classes = attrs.get('target_classes')
        target_users = attrs.get('target_users')

        has_targets = any([
            target_roles,
            target_classes,
            target_users
        ])

        if is_global and has_targets:

            raise serializers.ValidationError(
                'اگر اطلاعیه global باشد نباید مخاطب مشخص شود.'
            )

        if not is_global and not has_targets:

            raise serializers.ValidationError(
                'حداقل یک مخاطب باید مشخص شود.'
            )

        return attrs
    
    
class AnnouncementUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'descriptions', 'status',
            'is_global', 'target_roles', 'target_classes', 'target_users'
        ]

    def update(self, instance, validated_data):
        # ManyToMany فیلدهای رو جدا هندل میکنیم
        target_roles = validated_data.pop('target_roles', None)
        target_classes = validated_data.pop('target_classes', None)
        target_users = validated_data.pop('target_users', None)

        # فیلدهای معمولی
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # آپدیت ManyToMany
        if target_roles is not None:
            instance.target_roles.set(target_roles)
        if target_classes is not None:
            instance.target_classes.set(target_classes)
        if target_users is not None:
            instance.target_users.set(target_users)

        return instance
    


class RecipientStatusSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name')

    class Meta:
        model = AnnouncementRead
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
    created_at_jalali = serializers.SerializerMethodField()
    roles_data = RoleListSerializer(
        source='target_roles',
        many=True
    )
    courses_data = CourseMiniSerializer(
        source='target_classes',
        many=True
    )

    class Meta:
        model = Announcement
        fields = '__all__'

    def get_status_label(self, obj):
        labels = {
            'p': 'منتشر شده',
            'b': 'بازگردانی شده',
            'd': 'پیش‌نویس',
            'r': 'در انتظار بررسی',
        }
        return labels.get(obj.status, obj.status)

    def get_created_at_jalali(self, obj):
        if obj.created_at:
            return jdatetime.datetime.fromgregorian(datetime=obj.created_at).strftime("%Y/%m/%d")
        return None

class AnnounceLimitedSerializer(serializers.ModelSerializer):
    status_label = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)
    created_at_jalali = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ['id','title', 'descriptions', 'status_label', 'user', 'created_at_jalali', 'is_read']
    
    def get_status_label(self, obj):
        labels = {
            'p': 'منتشر شده',
            'b': 'بازگردانی شده',
            'd': 'پیش‌نویس',
            'r': 'در انتظار بررسی',
        }
        return labels.get(obj.status, obj.status)

    def get_created_at_jalali(self, obj):
        if obj.created_at:
            return jdatetime.datetime.fromgregorian(datetime=obj.created_at).strftime("%Y/%m/%d")
        return None
    
    def get_is_read(self, obj):
        if hasattr(obj, 'user_read_logs'):
            return len(obj.user_read_logs) > 0
        user = self.context['request'].user
        return obj.read_logs.filter(user=user).exists()
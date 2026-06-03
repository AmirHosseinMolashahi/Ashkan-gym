from rest_framework import serializers
from .models import Reminder, ReminderCategory
import jdatetime
from training.models import CustomUser



class ReminderCategorySerializers(serializers.ModelSerializer):

    class Meta:
        model = ReminderCategory
        fields = ['name']



class UserMiniSerializers(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'full_name']
    
    def get_full_name(self, obj):
        return obj.get_full_name() 


class RemindersSerializers(serializers.ModelSerializer):
    date_jalali = serializers.SerializerMethodField()
    user = UserMiniSerializers()
    category = ReminderCategorySerializers()
    time = serializers.TimeField(format="%H:%M")

    class Meta:
        model = Reminder
        fields = '__all__'
    
    def get_date_jalali(self, obj):
        if obj.date:
            return jdatetime.datetime.fromgregorian(datetime=obj.date).strftime("%Y/%m/%d")
        return None


class CreateReminderSerializers(serializers.ModelSerializer):
    date = serializers.CharField(required=False, allow_null=True)

    category = serializers.SlugRelatedField(
        slug_field='name',
        queryset=ReminderCategory.objects.all()
    )

    class Meta:
        model = Reminder
        fields = '__all__'
        read_only_fields = ['user', 'created_at']
    
    def validate_date(self, value):
        if not value:
            return None

        try:
            y, m, d = map(int, value.split('/'))
            gregorian_date = jdatetime.date(y, m, d).togregorian()
            return gregorian_date
        except:
            raise serializers.ValidationError("فرمت تاریخ شمسی نامعتبر است.")
from rest_framework import serializers
from .models import Notification
import jdatetime


class NotificationSerializer(serializers.ModelSerializer):
    created_at_jalali = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = '__all__'

    def get_created_at_jalali(self, obj):
        if obj.created_at:
            return jdatetime.datetime.fromgregorian(datetime=obj.created_at).strftime("%Y/%m/%d %H:%M")
        return None
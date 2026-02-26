from rest_framework import serializers
from .models import ActivityLog
import jdatetime
from training.serializers import StudentSerializer

class ActivityLogSerializer(serializers.ModelSerializer):
    actor = StudentSerializer()
    actor_id = serializers.IntegerField(source="actor.id", read_only=True)
    created_at_jalali = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "actor_id",
            "actor",
            "verb",
            "description",
            "metadata",
            "path",
            "method",
            "status_code",
            "created_at",
            "created_at_jalali",
        ]

    def get_created_at_jalali(self, obj):
        if obj.created_at:
            return jdatetime.datetime.fromgregorian(datetime=obj.created_at).strftime("%Y/%m/%d %H:%M")
        return None

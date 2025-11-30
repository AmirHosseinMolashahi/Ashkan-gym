from rest_framework import serializers
from .models import Schedule
import jdatetime


class RemindersSerializers(serializers.ModelSerializer):
    time = serializers.CharField(required=False, allow_null=True)
    time_jalali = serializers.SerializerMethodField()
    # finished = serializers.BooleanField(required=False, allow_null=True, read_only=True)
    id = serializers.IntegerField(required=False, allow_null=True, read_only=True)
    

    class Meta:
        model = Schedule
        fields = ['id','title', 'descriptions', 'time', 'finished', 'time_jalali']
    
    def get_time_jalali(self, obj):
        if obj.time:
            return jdatetime.datetime.fromgregorian(datetime=obj.time).strftime("%Y/%m/%d")
        return None

    def validate_time(self, value):
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
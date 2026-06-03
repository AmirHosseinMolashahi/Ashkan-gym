# filters.py
import django_filters
from .models import Notification

class NotificationFilter(django_filters.FilterSet):
    is_read = django_filters.BooleanFilter()
    category = django_filters.CharFilter()

    class Meta:
        model = Notification
        fields = ["category", "is_read"]
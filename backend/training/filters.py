import django_filters
from django.db.models import Q
from training.models import Enrollment


class EnrollmentFinancialFilter(django_filters.FilterSet):
    has_discount = django_filters.BooleanFilter(
        method='filter_has_discount'
    )

    class Meta:
        model = Enrollment
        fields = ['status']

    def filter_has_discount(self, queryset, name, value):
        discount_condition = (
            Q(pricing__monthly_fee__isnull=False) |
            Q(pricing__discount_amount__gt=0) |
            Q(pricing__discount_percent__gt=0)
        )

        if value:
            return queryset.filter(discount_condition)

        return queryset.exclude(discount_condition)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter

from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import ActivityLog
from .serializers import ActivityLogSerializer
from account.permissions import IsCoachOrManager
from training.paginations import CustomPagination


class RecentActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get("limit", 20))
        qs = ActivityLog.objects.filter(actor=request.user).order_by("-created_at")[:limit]
        return Response(ActivityLogSerializer(qs, many=True).data)


class ActivityPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class ManagerRecentActivityView(ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, IsCoachOrManager]

    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]

    filterset_fields = {
        'verb': ['exact'],
        'actor': ['exact'],
        'actor__roles__name': ['exact'],
    }

    search_fields = [
        'description',
        'path',
        'actor__first_name',
        'actor__last_name',
        'actor__national_id'
    ]

    def get_queryset(self):
        user = self.request.user

        qs = ActivityLog.objects.select_related("actor").order_by("-created_at")

        # 👇 گرفتن رول‌ها یکبار (بهینه)
        roles = set(user.roles.values_list("name", flat=True))

        # manager → بدون محدودیت
        if "manager" not in roles:
            if "coach" in roles:
                qs = qs.filter(
                    actor__enrollments__course__coach=user,
                    actor__enrollments__status="active"
                ).distinct()
            else:
                return ActivityLog.objects.none()
        
        return qs

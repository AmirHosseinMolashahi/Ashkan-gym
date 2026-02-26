from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

from .models import ActivityLog
from .serializers import ActivityLogSerializer
from account.permissions import IsManager


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
    permission_classes = [IsAuthenticated, IsManager]
    pagination_class = ActivityPagination

    def get_queryset(self):
        qs = ActivityLog.objects.select_related("actor").order_by("-created_at")

        verb = self.request.query_params.get("verb")
        actor_id = self.request.query_params.get("actor_id")
        search = self.request.query_params.get("search")

        if verb:
            qs = qs.filter(verb=verb)

        if actor_id:
            qs = qs.filter(actor_id=actor_id)

        if search:
            qs = qs.filter(
                Q(description__icontains=search) |
                Q(path__icontains=search) |
                Q(actor__first_name__icontains=search) |
                Q(actor__last_name__icontains=search) |
                Q(actor__national_id__icontains=search)
            )

        return qs

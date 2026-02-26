from django.urls import path
from .views import RecentActivityView, ManagerRecentActivityView

urlpatterns = [
    path("recent/", RecentActivityView.as_view(), name="recent-activity"),
    path("manager/recent/", ManagerRecentActivityView.as_view(), name="manager-recent-activity"),
]

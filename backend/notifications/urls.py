from django.urls import path
from .views import NotificationListView, UnreadNotificationListView, MarkAsReadView, CreateNotificationView, MarkAllAsReadView, UnreadCountView, DeleteNotifView

app_name = 'notifications'

urlpatterns = [
    path("all/", NotificationListView.as_view(), name="notification-list"),
    path("unread/", UnreadNotificationListView.as_view(), name="notification-unread"),
    path("read/<int:pk>/", MarkAsReadView.as_view(), name="notification-read"),
    path("create/", CreateNotificationView.as_view(), name="notification-create"),
    path("read-all/", MarkAllAsReadView.as_view(), name="notification-read-all"),
    path("unread-count/", UnreadCountView.as_view(), name="notification-unread-count"),
    path("<int:id>/delete/", DeleteNotifView.as_view(), name="notification-delete"),
]
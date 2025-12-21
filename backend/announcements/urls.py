from django.urls import path
from .views import AnnounceCreate, AnnounceList,MarkAnnouncementReadView, AnnouncementsDelete, AnnounceUpdate


app_name = 'announcements'

urlpatterns = [
    path('create/', AnnounceCreate.as_view(), name='create-announce'),
    path('lists/', AnnounceList.as_view(), name='announce-list'),
    path('<int:pk>/read/', MarkAnnouncementReadView.as_view(), name='announcement-read'),
    path('<int:id>/delete/', AnnouncementsDelete.as_view(), name='announcement-delete'),
    path('<int:id>/edit/', AnnounceUpdate.as_view(), name='announcement-update'),
]
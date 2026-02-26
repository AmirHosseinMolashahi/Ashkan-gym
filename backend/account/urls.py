from .views import (
  userView,
  LoginView,
  RefreshTokenView,
  RegisterView,
  LogoutView,
  UpdateUserView,
  UsersView,
  CompleteProfileView,
  AllUsersManagementView,
  UserManagementSummaryView,
  UserManagementDetailView,
  ManagerDeleteUserView,
  )
from django.urls import path

app_name = 'account'

urlpatterns = [
    path('user/', userView.as_view(), name='user'),
    path('users/', UsersView.as_view(), name='users'),
    path('all-users/', AllUsersManagementView.as_view(), name='all-users-management'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('register/complete-profile/<int:user_id>/', CompleteProfileView.as_view(), name='complete-profile'),
    path('logout/', LogoutView.as_view(), name='logou'),
    path('update/', UpdateUserView.as_view(), name='update-user'),
    path('management-summary/', UserManagementSummaryView.as_view(), name='management-summary'),
    path('management-users/<int:user_id>/', UserManagementDetailView.as_view(), name='management-user-detail'),
    path('management-users/<int:user_id>/delete/', ManagerDeleteUserView.as_view(), name='management-user-delete'),
]

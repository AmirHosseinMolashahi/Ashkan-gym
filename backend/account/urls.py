from .views import (
  userView,
  LoginView,
  RefreshTokenView,
  RegisterView,
  LogoutView,
  UpdateUserView,
  UsersView,
  CompleteProfileView,
  UsersManagementView,
  UserManagementDetailView,
  ManagerDeleteUserView,
  UsersWithoutInsuranceView,
  RolesListView,
  )
from django.urls import path

app_name = 'account'

urlpatterns = [
    path('user/', userView.as_view(), name='user'),
    path('users/', UsersView.as_view(), name='users'),
    path('users/management/', UsersManagementView.as_view(), name='users-management'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('register/complete-profile/<int:user_id>/', CompleteProfileView.as_view(), name='complete-profile'),
    path('logout/', LogoutView.as_view(), name='logou'),
    path('update/', UpdateUserView.as_view(), name='update-user'),
    path('management-users/<int:user_id>/', UserManagementDetailView.as_view(), name='management-user-detail'),
    path('management-users/<int:user_id>/delete/', ManagerDeleteUserView.as_view(), name='management-user-delete'),
    path('users/no-insurance/', UsersWithoutInsuranceView.as_view(), name='users-no-insurance'),
    path('roles/', RolesListView.as_view(), name='role-list')
]

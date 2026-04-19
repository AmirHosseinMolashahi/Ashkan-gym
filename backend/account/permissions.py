from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj == request.user

class IsManager(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.roles.filter(name="manager").exists()
        )

class IsCoachOrManager(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS or request.user.roles.filter(name__in=['coach', 'manager']).exists():
            return True
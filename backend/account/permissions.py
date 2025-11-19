from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj == request.user

class IsManager(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS or request.user.is_manager == True:
            return True
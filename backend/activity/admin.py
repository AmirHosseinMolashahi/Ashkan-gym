from django.contrib import admin
from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = (
        "created_at",
        "actor",
        "verb",
        "resource",
        "resource_id",
        "outcome",
        "status_code",
        "path",
    )
    list_filter = ("verb", "status_code", "created_at")
    search_fields = (
        "actor__username",
        "description",
        "path",
        "metadata",
    )
    readonly_fields = (
        "actor",
        "verb",
        "description",
        "path",
        "method",
        "ip",
        "user_agent",
        "status_code",
        "metadata",
        "created_at",
    )
    ordering = ("-created_at",)

    def resource(self, obj):
        return obj.metadata.get("resource", "-")

    def resource_id(self, obj):
        return obj.metadata.get("resource_id", "-")

    def outcome(self, obj):
        return obj.metadata.get("outcome", "-")

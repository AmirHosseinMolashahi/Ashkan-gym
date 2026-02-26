from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from .constants import ActionType


class ActivityLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    verb = models.CharField(max_length=64, choices=ActionType.choices)
    description = models.CharField(max_length=255, blank=True)
    target_ct = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    target_id = models.CharField(max_length=64, null=True, blank=True)
    target = GenericForeignKey("target_ct", "target_id")
    metadata = models.JSONField(default=dict, blank=True)
    path = models.CharField(max_length=255, blank=True)
    method = models.CharField(max_length=8, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    status_code = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
      indexes = [
          models.Index(fields=["actor", "-created_at"]),
          models.Index(fields=["verb", "-created_at"]),
          models.Index(fields=["target_ct", "target_id"]),
          models.Index(fields=["-created_at"]),
      ]
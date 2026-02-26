from django.contrib.contenttypes.models import ContentType
from .models import ActivityLog
from .constants import ActionType


def log_activity(
    *,
    actor=None,
    verb: ActionType,
    description: str = "",
    target=None,
    metadata: dict | None = None,
    request=None,
    status_code: int | None = None,
):
    target_ct = None
    target_id = None
    if target is not None:
        target_ct = ContentType.objects.get_for_model(target, for_concrete_model=False)
        target_id = str(target.pk)

    path = ""
    method = ""
    ip = None
    user_agent = ""

    if request is not None:
        path = request.path
        method = request.method
        ip = _get_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")

    return ActivityLog.objects.create(
        actor=actor,
        verb=verb,
        description=description,
        target_ct=target_ct,
        target_id=target_id,
        metadata=metadata or {},
        path=path,
        method=method,
        ip=ip,
        user_agent=user_agent,
        status_code=status_code,
    )

from .tasks import log_activity_task

def log_activity_async(
    *,
    actor=None,
    verb,
    description="",
    target=None,
    metadata=None,
    request=None,
    status_code=None,
):
    target_ct_id = None
    target_id = None
    if target is not None:
        target_ct_id = ContentType.objects.get_for_model(
            target, for_concrete_model=False
        ).id
        target_id = str(target.pk)

    payload = {
        "actor_id": getattr(actor, "id", None),
        "verb": verb,
        "description": description,
        "target_ct_id": target_ct_id,
        "target_id": target_id,
        "metadata": metadata or {},
        "path": request.path if request else "",
        "method": request.method if request else "",
        "ip": _get_client_ip(request) if request else None,
        "user_agent": request.META.get("HTTP_USER_AGENT", "") if request else "",
        "status_code": status_code,
    }
    log_activity_task.delay(payload)



def _get_client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")

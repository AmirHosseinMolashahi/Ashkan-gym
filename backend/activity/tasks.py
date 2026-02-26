from celery import shared_task
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from .models import ActivityLog
from datetime import timedelta, date
from django.utils import timezone
from django.db import connection

@shared_task
def log_activity_task(payload: dict):
    User = get_user_model()
    actor_id = payload.get("actor_id")
    actor = None
    if actor_id:
        actor = User.objects.filter(id=actor_id).first()

    target_ct = None
    target_id = payload.get("target_id")
    target_ct_id = payload.get("target_ct_id")
    if target_ct_id:
        target_ct = ContentType.objects.filter(id=target_ct_id).first()

    ActivityLog.objects.create(
        actor=actor,
        verb=payload["verb"],
        description=payload.get("description", ""),
        target_ct=target_ct,
        target_id=target_id,
        metadata=payload.get("metadata", {}),
        path=payload.get("path", ""),
        method=payload.get("method", ""),
        ip=payload.get("ip"),
        user_agent=payload.get("user_agent", ""),
        status_code=payload.get("status_code"),
    )



@shared_task
def cleanup_old_activity_logs(months=6):
    cutoff = timezone.now() - timedelta(days=30 * months)
    return ActivityLog.objects.filter(created_at__lt=cutoff).delete()



@shared_task
def create_next_month_partition():
    today = timezone.localdate()
    # ماه بعد
    year = today.year + (1 if today.month == 12 else 0)
    month = 1 if today.month == 12 else today.month + 1

    start = date(year, month, 1)
    if month == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month + 1, 1)

    table_name = f"activity_activitylog_{start.year}_{start.month:02d}"

    sql = f"""
    CREATE TABLE IF NOT EXISTS {table_name}
    PARTITION OF activity_activitylog
    FOR VALUES FROM ('{start}') TO ('{end}');
    """

    with connection.cursor() as cursor:
        cursor.execute(sql)

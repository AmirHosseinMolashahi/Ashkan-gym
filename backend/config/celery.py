import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

app.conf.beat_schedule = {
    "cleanup-old-activity-logs-daily": {
        "task": "activity.tasks.cleanup_old_activity_logs",
        "schedule": crontab(hour=3, minute=0),
        "args": (6,),
    },
}

app.conf.beat_schedule.update({
    "create-next-month-activity-partition": {
        "task": "activity.tasks.create_next_month_partition",
        "schedule": crontab(day_of_month=25, hour=3, minute=0),
    },
})
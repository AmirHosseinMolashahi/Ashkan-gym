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
    "create-next-month-activity-partition": {
        "task": "activity.tasks.create_next_month_partition",
        "schedule": crontab(day_of_month=25, hour=3, minute=0),
    },
    "update-insurance-daily": {
        "task": "account.tasks.update_insurance_task",
        "schedule": crontab(hour=0, minute=0),
    },
    "run-monthly-generation": {
        "task": "payment.tasks.run_monthly_generation",
        "schedule": crontab(hour=0, minute=5),  # هر روز اجرا میشه
    },
    "check-overdue-invoices-daily": {
        "task": "payment.tasks.send_overdue_invoice_notifications",
        "schedule": crontab(hour=9, minute=0),  # هر روز ساعت 9 صبح
    },
}


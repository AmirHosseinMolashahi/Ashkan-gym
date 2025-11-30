from django.db import models
from account.models import CustomUser

# Create your models here.

class Schedule(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    title = models.CharField()
    descriptions = models.TextField()
    time = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    finished = models.BooleanField(default=False, blank=True)

    def __str__(self):
        return self.title + " " + self.user.get_full_name()
    
    class Meta:
        verbose_name = 'تقویم'
        verbose_name_plural = 'تقویم ها'
        ordering = ["finished", "time", "created_at"]
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

# Create your models here.
class Project(models.Model):
   user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
   title = models.CharField(max_length=200)
   description = models.TextField()
   technologies = models.CharField(max_length=200)
   project_link = models.URLField(blank=True, null=True)
   created_at = models.DateTimeField(auto_now_add=True)

   def __str__(self):
      return self.title
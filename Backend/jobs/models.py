from django.db import models
from skills.models import Skill
from django.conf import settings

# Create your models here.

User = settings.AUTH_USER_MODEL

class Job(models.Model):
  title = models.CharField(max_length =200)
  company = models.CharField(max_length=200)
  description = models.TextField()
  required_skills = models.ManyToManyField(Skill)
  job_link = models.URLField()
  location = models.CharField(max_length=200)
  posted_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return self.title
  
class JobApplication(models.Model):
  job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
  user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='applications')
  cover_letter = models.TextField()
  applied_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"{self.user} - {self.job}"
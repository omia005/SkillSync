from django.db import models
from django.conf import settings

# Create your models here.
User = settings.AUTH_USER_MODEL

class Skill(models.Model):
  name = models.CharField(max_length=100)
  category = models.CharField(max_length=100)

  def __str__(self):
    return self.name
  
class UserSkill(models.Model):
  LEVEL_CHOICES = (
    ('Beginner', 'Beginner'),
    ('Intermediate', 'Intermediate'),
    ('Advanced', 'Advanced') 
  )

  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user')
  skill= models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='skills')
  proficiency= models.CharField(max_length=200, choices=LEVEL_CHOICES)

  def __str__(self):
    return f"{self.user} - {self.skill}"
  
class CareerPath(models.Model):
  name = models.CharField(max_length=100)
  skills_required = models.ManyToManyField(Skill)

  def __str__(self):
    return self.name
  

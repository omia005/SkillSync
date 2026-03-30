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

  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='users')
  skill= models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='skills')
  proficiency= models.CharField(max_length=200, choices=LEVEL_CHOICES)

  def __str__(self):
    return f"{self.user} - {self.skill}"
  

class TechnologyTool(models.Model):
  name = models.CharField(max_length=255, unique=True)

  def __str__(self):
    return self.name  


class CareerPath(models.Model):
  name = models.CharField(max_length=100)
  description = models.TextField(default="no description provided")
  skills_required = models.ManyToManyField(Skill, blank=True, related_name='career_paths')
  required_tools = models.ManyToManyField(TechnologyTool, blank=True)
  
  def __str__(self):
    return self.name
  
class CareerRoadmap(models.Model):
  career = models.ForeignKey(CareerPath, on_delete=models.CASCADE, related_name='career')
  skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
  step_order = models.IntegerField()
  learning_resources = models.URLField(blank=True, null=True)

  def __str__(self):
    return f'{self.career.name} - Step {self.step_order}'
  

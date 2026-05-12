from django.db import models
from django.conf import settings
from django.contrib import admin

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
    ('Advanced', 'Advanced'),
    ('Expert', 'Expert')
  )

  CATEGORY_CHOICES = (
    ('Programming Language', 'Programming language'),
    ('Framework', 'Framework'),
    ('Databases', 'Databases'),
    ('Tool', 'Tool'),
    ('Soft skill', 'Soft Skill'),
    ('Other', 'Other')
  )

  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
  skill= models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='userskills')
  category= models.CharField(max_length=200, choices=CATEGORY_CHOICES, blank=True, null=True)
  proficiency= models.CharField(max_length=200, choices=LEVEL_CHOICES)

  def __str__(self):
    return f"{self.user} - {self.userskills}"


class CareerPath(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=20, null=True, blank=True)
    salary = models.CharField(max_length=100,default=0)
    tools_needed = models.JSONField(default=list)
    skills_required = models.JSONField(default=list)
    applications = models.JSONField(default=list)
    industries = models.JSONField(default=list)
    
    
    def __str__(self):
        return self.title

class LearningStage(models.Model):
    careerpath = models.ForeignKey(CareerPath, related_name="learning_path", on_delete=models.CASCADE)
    stage = models.CharField(max_length=100)  # e.g. "Foundations"
    duration = models.CharField(max_length=50)  # e.g. "6–8 weeks"

    def __str__(self):
        return f"{self.stage} ({self.careerpath.title})"


class Topic(models.Model):
    stage = models.ForeignKey(LearningStage, related_name="topics", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)  # e.g. "HTML5"

    def __str__(self):
        return self.name


class Resource(models.Model):
    stage = models.ForeignKey(LearningStage, related_name="resources", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)  # e.g. "The Odin Project — Foundations"
    url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name


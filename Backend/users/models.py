from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('admin', 'Admin')
    )
    
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    bio = models.TextField(blank=True, null=True)
    linkedIn = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    portfolio = models.URLField(blank=True, null=True)
    username = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.first_name
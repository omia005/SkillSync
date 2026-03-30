from django.shortcuts import render
from rest_framework import generics
from .models import Project
from .serializers import ProjectSerializer

# Create your views here.

class ProjectListView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


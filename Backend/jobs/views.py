from django.shortcuts import render
from rest_framework import generics
from .models import Job, JobApplication
from .serializers import JobSerializer

# Create your views here.
class JobListView(generics.ListCreateAPIView):

    queryset = Job.objects.all()
    serializer_class = JobSerializer

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Job.objects.all()
    serializer_class = JobSerializer
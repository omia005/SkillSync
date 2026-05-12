from django.urls import path, include
from .views import  SkillViewset, UserSkillViewset, CareerPathViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register(r'skills', SkillViewset)
router.register(r'user-skills', UserSkillViewset)
router.register("career-paths", CareerPathViewSet, basename="career-paths")



urlpatterns = [
   path('', include(router.urls)),
   #path('skill-gap-analysis/<int:user_id>/<int:career_id>/', SkillGapAnalysisView.as_view(), name='skill-gap-analysis'),
   #path('career-roadmap/<int:user_id>/<int:career_id>/', CareerRoadmapRecommendation.as_view(), name='career-roadmap'),
]
from django.urls import path, include
from .views import SkillGapAnalysisView, SkillViewset, UserSkillViewset, CareerPathViewset, CareerRoadmapRecommendation
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register(r'skills', SkillViewset)
router.register(r'user-skills', UserSkillViewset)
router.register(r'career-paths', CareerPathViewset)

urlpatterns = [
   path('', include(router.urls)),
   path('skill-gap-analysis/<int:user_id>/<int:career_id>/', SkillGapAnalysisView.as_view(), name='skill-gap-analysis'),
   path('career-roadmap/<int:user_id>/<int:career_id>/', CareerRoadmapRecommendation.as_view(), name='career-roadmap'),
]
from django.urls import path, include
from .views import (
    SkillViewset, UserSkillViewset, CareerPathViewSet,
    AdminStatsView,
    FilterReportView, SummaryReportView, DetailedReportView,
    SkillGapAnalysisView, SkillGapReportView,
    AdminFilteredStatsView,
    AdminStudentsReportPDFView, AdminSkillsReportPDFView, AdminCareerPathsReportPDFView,
    AdminStudentsStatsView, AdminSkillsStatsView, AdminCareerPathsStatsView,
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register(r'skills', SkillViewset)
router.register(r'user-skills', UserSkillViewset)
router.register("career-paths", CareerPathViewSet, basename="career-paths")

urlpatterns = [
    path('', include(router.urls)),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/stats/filtered/', AdminFilteredStatsView.as_view(), name='admin-stats-filtered'),
    path('admin/reports/filter/', FilterReportView.as_view(), name='filter-report'),
    path('admin/reports/summary/', SummaryReportView.as_view(), name='summary-report'),
    path('admin/reports/detailed/', DetailedReportView.as_view(), name='detailed-report'),
    # Section-specific PDF + JSON endpoints
    path('admin/reports/students/pdf/', AdminStudentsReportPDFView.as_view(), name='students-pdf'),
    path('admin/reports/skills/pdf/', AdminSkillsReportPDFView.as_view(), name='skills-pdf'),
    path('admin/reports/careers/pdf/', AdminCareerPathsReportPDFView.as_view(), name='careers-pdf'),
    path('admin/reports/students/', AdminStudentsStatsView.as_view(), name='students-stats'),
    path('admin/reports/skills/', AdminSkillsStatsView.as_view(), name='skills-stats'),
    path('admin/reports/careers/', AdminCareerPathsStatsView.as_view(), name='careers-stats'),
    path('skill-gap-analysis/', SkillGapAnalysisView.as_view(), name='skill-gap-analysis'),
    path('skill-gap-report/', SkillGapReportView.as_view(), name='skill-gap-report'),
]
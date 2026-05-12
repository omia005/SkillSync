from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import UserSkill, Skill, CareerPath
from .serializers import UserSkillSerializer, SkillSerializer, CareerPathSerializer

# Create your views here.
class SkillViewset(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    

class UserSkillViewset(viewsets.ModelViewSet):
    
    queryset = UserSkill.objects.all()
    serializer_class = UserSkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CareerPathViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CareerPath.objects.prefetch_related(
       "learning_path__topics",
       "learning_path__resources"
    )
    serializer_class = CareerPathSerializer
    lookup_field = "slug"

"""
class SkillGapAnalysisView(APIView):
    def get(self, request, user_id, career_id):
        required_skills = CareerPath.objects.get(id=career_id).skills_required.all()
        userskills = UserSkill.objects.filter(user_id=user_id)

        required_skills_names = [skill.name for skill in required_skills]
        user_skills_names = [skill.name for skill in userskills]
    
        matching_skills = list(set(required_skills_names) & set(user_skills_names))
        missing_skills = list(set(required_skills_names) - set(user_skills_names))

        total_required = len(required_skills_names)
        total_matching = len(matching_skills)
        

        if total_required == 0:
            readiness = 0
        else:
            readiness = (total_matching / total_required) * 100

        return Response({
            "career_path": CareerPath.name,
            "user_skills": user_skills_names,
            "required_skills": required_skills_names,
            "matched_skills": matching_skills,
            "missing_skills": missing_skills,
            "readiness_score": f"{round(readiness)}%"
        })
"""


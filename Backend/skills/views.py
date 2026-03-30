from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.views import APIView
from .models import UserSkill, Skill, CareerPath, CareerRoadmap
from .serializers import CareerPathSerializer, UserSkillSerializer, SkillSerializer

# Create your views here.
class SkillViewset(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class UserSkillViewset(viewsets.ModelViewSet):
    queryset = UserSkill.objects.all()
    serializer_class = UserSkillSerializer

class CareerPathViewset(viewsets.ModelViewSet):
    queryset = CareerPath.objects.all()
    serializer_class = CareerPathSerializer

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


class CareerRoadmapRecommendation(APIView):

    def get(self, request, user_id, career_id):

        roadmap = CareerRoadmap.objects.filter(
            career_id=career_id
        ).order_by("step_order")

        user_skills = UserSkill.objects.filter(user_id=user_id)

        user_skill_names = [s.skill.name for s in user_skills]

        steps = []

        for step in roadmap:

            status = "Completed" if step.skill.name in user_skill_names else "Missing"

            steps.append({
                "step": step.step_order,
                "skill": step.skill.name,
                "status": status,
                "learning_resource": step.learning_resource
            })

        return Response({
            "career": roadmap.first().career.name if roadmap else None,
            "roadmap": steps
        })

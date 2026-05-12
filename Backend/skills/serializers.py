
import requests
from .models import Skill, UserSkill, CareerPath, Resource, Topic, LearningStage
from rest_framework import serializers
from requests.auth import HTTPBasicAuth
from skills.services.onet_api import OnetAPI

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category']

class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)   # nested representation
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), source="skill", write_only=True
    )

    class Meta:
        model = UserSkill
        fields = ['id', 'skill', 'skill_id', 'category', 'proficiency']

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ["id", "name"]


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ["id", "name", "url"]


class LearningStageSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    resources = ResourceSerializer(many=True, read_only=True)

    class Meta:
        model = LearningStage
        fields = ["id", "stage", "duration", "topics", "resources"]
        
class CareerPathSerializer(serializers.ModelSerializer):
    skills_required = SkillSerializer(many=True)
    learning_path = LearningStageSerializer(many=True, read_only=True)

    def get_learning_path(self, obj):
      stages = obj.learning_path.all().order_by("order")
      return LearningStageSerializer(stages, many=True).data

    class Meta:
        model = CareerPath
        fields = ["id", "slug", "title", "description", "icon", "salary", "learning_path", "industries", "applications", "skills_required", "tools_needed"]


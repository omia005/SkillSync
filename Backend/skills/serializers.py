
import requests
from .models import Skill, UserSkill, CareerPath, TechnologyTool, CareerRoadmap
from rest_framework import serializers
from requests.auth import HTTPBasicAuth
from skills.services.onet_api import OnetAPI

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class UserSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSkill
        fields = '__all__'

class CareerPathSerializer(serializers.ModelSerializer):
    skills_required = serializers.SerializerMethodField()
    tools_required = serializers.SerializerMethodField()

    class Meta:
        model = CareerPath
        fields = ['id', 'name', 'description', 'skills_required', 'tools_required']

    def get_skills_required(self, obj):
        return [skill.name for skill in obj.skills_required.all()]

    def get_tools_required(self, obj):
        return [tool.name for tool in obj.required_tools.all()]

    def create(self, validated_data):
        career_name = validated_data.get("name")

        # Fetch skills from O*NET
        api = OnetAPI(api_key="ygbK4-aKHw7-Bmcj5-9ejYx")
        skill_names = api.get_skills_for_career(career_name)

        # Fetch tools/technologies
        tool_names = api.get_tools_for_career(career_name)
        tools = [TechnologyTool.objects.get_or_create(name=n)[0] for n in tool_names]

        # Create the career path
        career_path = CareerPath.objects.create(**validated_data)
        
        # Ensure skills exist in DB and collect them in a list
        skills = []
        for name in skill_names:
          skill, _ = Skill.objects.get_or_create(name=name)
        skills.append(skill)

        # Map skills to your Skill model
        skills = Skill.objects.filter(name__in=skill_names)
        career_path.skills_required.set(skills)
        career_path.required_tools.set(tools)
        
        return career_path
    
class CareerRoadmapSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerRoadmap
        fields = '__all__'

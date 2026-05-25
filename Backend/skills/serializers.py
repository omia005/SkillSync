
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

class LearningStageWriteSerializer(serializers.ModelSerializer):
    topics = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    resources = serializers.ListField(child=serializers.DictField(), required=False, write_only=True)

    class Meta:
        model = LearningStage
        fields = ["id", "stage", "duration", "topics", "resources"]

    def create(self, validated_data):
        topics_data = validated_data.pop("topics", [])
        resources_data = validated_data.pop("resources", [])
        stage = LearningStage.objects.create(**validated_data)
        for topic_name in topics_data:
            Topic.objects.create(stage=stage, name=topic_name)
        for res_data in resources_data:
            Resource.objects.create(stage=stage, **res_data)
        return stage

    def update(self, instance, validated_data):
        topics_data = validated_data.pop("topics", None)
        resources_data = validated_data.pop("resources", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if topics_data is not None:
            instance.topics.all().delete()
            for topic_name in topics_data:
                Topic.objects.create(stage=instance, name=topic_name)
        if resources_data is not None:
            instance.resources.all().delete()
            for res_data in resources_data:
                Resource.objects.create(stage=instance, **res_data)
        return instance

class CareerPathSerializer(serializers.ModelSerializer):
    learning_path = LearningStageSerializer(many=True, read_only=True)

    class Meta:
        model = CareerPath
        fields = ["id", "slug", "title", "description", "icon", "salary", "learning_path", "industries", "applications", "skills_required", "tools_needed"]

class CareerPathWriteSerializer(serializers.ModelSerializer):
    learning_path = LearningStageWriteSerializer(many=True, required=False)

    class Meta:
        model = CareerPath
        fields = ["id", "slug", "title", "description", "icon", "salary", "tools_needed", "skills_required", "applications", "industries", "learning_path"]

    def create(self, validated_data):
        learning_path_data = validated_data.pop("learning_path", [])
        career = CareerPath.objects.create(**validated_data)
        for stage_data in learning_path_data:
            stage_serializer = LearningStageWriteSerializer(data=stage_data)
            stage_serializer.is_valid(raise_exception=True)
            stage_serializer.save(careerpath=career)
        return career

    def update(self, instance, validated_data):
        learning_path_data = validated_data.pop("learning_path", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if learning_path_data is not None:
            instance.learning_path.all().delete()
            for stage_data in learning_path_data:
                stage_serializer = LearningStageWriteSerializer(data=stage_data)
                stage_serializer.is_valid(raise_exception=True)
                stage_serializer.save(careerpath=instance)
        return instance


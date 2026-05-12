from rest_framework import serializers
from .models import CV, PersonalInfo, Education, Experience, Project, Skill


class PersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalInfo
        fields = '__all__'

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class CVSerializer(serializers.ModelSerializer):
    personal = PersonalInfoSerializer(read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = CV
        fields = ['id', 'title', 'created_at', 'personal', 'education', 'experience', 'projects', 'skills']

    def create(self, validated_data):
       user = self.context["request"].user

       cv = CV.objects.create(user=user)

       # AUTO-FILL from user model
       PersonalInfo.objects.create(
         cv=cv,
         full_name=f"{user.first_name} {user.last_name}",
         email=user.email,
         linkedin=user.linkedIn,
         github=user.github,
         portfolio=user.portfolio,
       )
       for user_skill in user.skills.all():
          Skill.objects.create(
          cv=cv,
          name=user_skill.skill.name,
          level=user_skill.proficiency
        )


       return cv
    
    def update(self, instance, validated_data):
      personal_data = validated_data.pop("personal", None)

      if personal_data:
        personal = instance.personal

        for attr, value in personal_data.items():
            setattr(personal, attr, value)

        personal.save()

      instance.title = validated_data.get("title", instance.title)
      instance.save()

      return instance
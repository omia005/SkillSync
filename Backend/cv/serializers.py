from rest_framework import serializers
from .models import CV, PersonalInfo, Education, Experience, Project, Skill


class PersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalInfo
        exclude = ("cv",)
        extra_kwargs = {
            "phone": {"allow_blank": True, "required": False, "default": ""},
            "location": {"allow_blank": True, "required": False, "default": ""},
            "linkedin": {"allow_blank": True, "required": False, "default": ""},
            "github": {"allow_blank": True, "required": False, "default": ""},
            "portfolio": {"allow_blank": True, "required": False, "default": ""},
            "summary": {"allow_blank": True, "required": False, "default": ""},
        }


class EducationSerializer(serializers.ModelSerializer):
    field_of_study = serializers.CharField(
        source="field", allow_blank=True, required=False, default=""
    )

    class Meta:
        model = Education
        fields = [
            "id",
            "school",
            "degree",
            "field_of_study",
            "start_date",
            "end_date",
        ]
        extra_kwargs = {
            "school": {"required": True},
            "degree": {"required": True},
            "start_date": {"allow_blank": True, "required": False, "default": ""},
            "end_date": {"allow_blank": True, "required": False, "default": ""},
        }


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        exclude = ("cv",)
        extra_kwargs = {
            "company": {"required": True},
            "role": {"required": True},
            "start_date": {"allow_blank": True, "required": False, "default": ""},
            "end_date": {"allow_blank": True, "required": False, "default": ""},
            "description": {"allow_blank": True, "required": False, "default": ""},
        }


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        exclude = ("cv",)
        extra_kwargs = {
            "name": {"required": True},
            "description": {"allow_blank": True, "required": False, "default": ""},
            "link": {"allow_blank": True, "required": False, "default": ""},
        }


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        exclude = ("cv",)
        extra_kwargs = {
            "name": {"required": True},
            "level": {"allow_blank": True, "required": False, "default": ""},
        }


class CVSerializer(serializers.ModelSerializer):
    personal = PersonalInfoSerializer(required=False)
    education = EducationSerializer(many=True, required=False)
    experience = ExperienceSerializer(many=True, required=False)
    projects = ProjectSerializer(many=True, required=False)
    skills = SkillSerializer(many=True, required=False)

    class Meta:
        model = CV
        fields = [
            "id",
            "title",
            "created_at",
            "personal",
            "education",
            "experience",
            "projects",
            "skills",
        ]
        read_only_fields = ("id", "created_at")
        extra_kwargs = {
            "title": {"required": False},
        }

    def create(self, validated_data):
        user = self.context["request"].user

        cv = CV.objects.create(user=user)

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
                level=user_skill.proficiency,
            )

        return cv

    def update(self, instance, validated_data):
        education_data = validated_data.pop("education", None)
        experience_data = validated_data.pop("experience", None)
        personal_data = validated_data.pop("personal", None)
        skills_data = validated_data.pop("skills", None)
        projects_data = validated_data.pop("projects", None)

        if personal_data is not None:
            personal = instance.personal
            for attr, value in personal_data.items():
                setattr(personal, attr, value)
            personal.save()

        if education_data is not None:
            instance.education.all().delete()
            for edu in education_data:
                Education.objects.create(cv=instance, **edu)

        if experience_data is not None:
            instance.experience.all().delete()
            for exp in experience_data:
                Experience.objects.create(cv=instance, **exp)

        if skills_data is not None:
            instance.skills.all().delete()
            for skill in skills_data:
                Skill.objects.create(cv=instance, **skill)

        if projects_data is not None:
            instance.projects.all().delete()
            for proj in projects_data:
                Project.objects.create(cv=instance, **proj)

        instance.save()
        return instance
from rest_framework import serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from .models import CV, PersonalInfo, Education, Experience, Project, Skill


class CVSerializer(serializers.ModelSerializer):
    class Meta:
        model = CV
        fields = ["id", "title", "created_at"]
        read_only_fields = ("id", "created_at")


class PersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalInfo
        fields = "__all__"
        read_only_fields = ("id", "cv")


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
        read_only_fields = ("id",)


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = "__all__"
        read_only_fields = ("id", "cv")


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ("id", "cv")


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = "__all__"
        read_only_fields = ("id", "cv")


class CVFullSerializer(serializers.ModelSerializer):
    personal = PersonalInfoSerializer(read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)

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


class CVViewSet(viewsets.ModelViewSet):
    serializer_class = CVSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CV.objects.filter(user=self.request.user).select_related("personal")

    def perform_create(self, serializer):
        user = self.request.user
        cv = serializer.save(user=user)

        PersonalInfo.objects.create(
            cv=cv,
            full_name=f"{user.first_name} {user.last_name}",
            email=user.email,
            linkedin=user.linkedIn or "",
            github=user.github or "",
            portfolio=user.portfolio or "",
        )
        for user_skill in user.skills.all():
            Skill.objects.create(
                cv=cv,
                name=user_skill.skill.name,
                level=user_skill.proficiency,
            )

    @action(
        detail=True,
        methods=["patch"],
        url_path="update-fields",
        url_name="update-fields",
    )
    def update_fields(self, request, pk=None):
        cv = self.get_object()
        data = request.data

        # ---- Personal Info ----
        personal_data = data.get("personal")
        if personal_data is not None:
            personal = cv.personal
            for key in [
                "full_name", "email", "phone",
                "location", "linkedin", "github",
                "portfolio", "summary",
            ]:
                if key in personal_data:
                    setattr(personal, key, personal_data[key])
            personal.save()

        # ---- Education ----
        education_data = data.get("education")
        if education_data is not None:
            cv.education.all().delete()
            for edu in education_data:
                Education.objects.create(
                    cv=cv,
                    school=edu.get("school", ""),
                    degree=edu.get("degree", ""),
                    field=edu.get("field_of_study", ""),
                    start_date=edu.get("start_date", ""),
                    end_date=edu.get("end_date", ""),
                )

        # ---- Experience ----
        experience_data = data.get("experience")
        if experience_data is not None:
            cv.experience.all().delete()
            for exp in experience_data:
                Experience.objects.create(
                    cv=cv,
                    company=exp.get("company", ""),
                    role=exp.get("role", ""),
                    start_date=exp.get("start_date", ""),
                    end_date=exp.get("end_date", ""),
                    description=exp.get("description", ""),
                )

        # ---- Skills ----
        skills_data = data.get("skills")
        if skills_data is not None:
            cv.skills.all().delete()
            for sk in skills_data:
                Skill.objects.create(
                    cv=cv,
                    name=sk.get("name", ""),
                    level=sk.get("level", ""),
                )

        # ---- Projects ----
        projects_data = data.get("projects")
        if projects_data is not None:
            cv.projects.all().delete()
            for proj in projects_data:
                Project.objects.create(
                    cv=cv,
                    name=proj.get("name", ""),
                    description=proj.get("description", ""),
                    link=proj.get("link", ""),
                )

        # Return the full updated CV
        full_serializer = CVFullSerializer(cv)
        return Response(full_serializer.data, status=status.HTTP_200_OK)
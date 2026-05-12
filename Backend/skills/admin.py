from django.contrib import admin
import nested_admin
from .models import Skill, UserSkill, CareerPath, LearningStage, Resource, Topic


class TopicInline(nested_admin.NestedTabularInline):
    model = Topic
    extra = 1


class ResourceInline(nested_admin.NestedTabularInline):
    model = Resource
    extra = 1


class LearningStageInline(nested_admin.NestedStackedInline):
    model = LearningStage
    extra = 1
    inlines = [TopicInline, ResourceInline]


class CareerPathAdmin(nested_admin.NestedModelAdmin):
    inlines = [LearningStageInline]

    prepopulated_fields = {"slug": ("title",)}
    list_display = ("title",)
   

# Register your models here.
admin.site.register(Skill)
admin.site.register(UserSkill)
admin.site.register(CareerPath, CareerPathAdmin)


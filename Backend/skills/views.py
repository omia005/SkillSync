from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from users.permissions import IsAdminUserRole
from rest_framework.decorators import action
from django.http import HttpResponse
from django.core.exceptions import FieldError
from django.db import models
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from datetime import datetime
from .models import UserSkill, Skill, CareerPath, LearningStage
from .serializers import UserSkillSerializer, SkillSerializer, CareerPathSerializer, CareerPathWriteSerializer

# Create your views here.


def _safe_date_filter(qs, start_date, end_date):
    """Apply created_at date range filters to a queryset, silently skipping models
    (like Skill / CareerPath) that do not have a created_at / date field."""
    try:
        if start_date:
            qs = qs.filter(created_at__gte=start_date)
    except FieldError:
        pass
    try:
        if end_date:
            qs = qs.filter(created_at__lte=end_date)
    except FieldError:
        pass
    return qs
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

class CareerPathViewSet(viewsets.ModelViewSet):
    queryset = CareerPath.objects.prefetch_related(
        "learning_path__topics",
        "learning_path__resources"
    )
    serializer_class = CareerPathSerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserRole(), IsAuthenticated()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CareerPathWriteSerializer
        return CareerPathSerializer

class AdminStatsView(APIView):

    def _get_filtered_students(self, start_date=None, end_date=None, career=None, search=None):
        from users.models import User as UserModel
        queryset = UserModel.objects.filter(role='student')
        if search:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search)
            )
        if career:
            queryset = queryset.filter(selected_career=career)
        if start_date:
            queryset = queryset.filter(date_joined__gte=start_date)
        if end_date:
            queryset = queryset.filter(date_joined__lte=end_date)
        return queryset

    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        is_admin = user.is_staff or user.role == 'admin'
        if not is_admin:
            return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

        # Read filter params
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        career_filter = request.query_params.get('career')
        search = request.query_params.get('search')

        from users.models import User as UserModel

        student_qs = self._get_filtered_students(start_date, end_date, career_filter, search)
        total_users = student_qs.count() + UserModel.objects.filter(role='admin').count()
        active_users = student_qs.filter(is_active=True).count() + UserModel.objects.filter(role='admin', is_active=True).count()
        profile_complete = student_qs.filter(is_profile_complete=True).count()
        profile_incomplete = student_qs.count() - profile_complete
        students = student_qs.count()
        admins = UserModel.objects.filter(role='admin').count()

        from collections import Counter
        career_counts = Counter()
        for u in student_qs:
            if u.selected_career:
                career_counts[u.selected_career] += 1

        career_paths_qs = CareerPath.objects.all()
        if search:
            career_paths_qs = career_paths_qs.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search)
            )
        if start_date:
            career_paths_qs = _safe_date_filter(career_paths_qs, start_date, end_date)

        career_paths = []
        for cp in career_paths_qs:
            required = cp.skills_required if isinstance(cp.skills_required, list) else []
            career_paths.append({
                "title": cp.title,
                "slug": cp.slug,
                "required_skills_count": len(required),
                "required_skills": required,
            })

        top_skills_qs = UserSkill.objects.select_related('skill')
        if start_date:
            top_skills_qs = _safe_date_filter(top_skills_qs, start_date, end_date)
        from django.db.models import Count
        top_skills = top_skills_qs.values('skill__name').annotate(
            total=Count('id')
        ).order_by('-total')[:10]

        skills_qs = Skill.objects.all()
        if search:
            skills_qs = skills_qs.filter(
                models.Q(name__icontains=search) |
                models.Q(category__icontains=search)
            )
        if start_date:
            skills_qs = _safe_date_filter(skills_qs, start_date, end_date)
        total_skills_count = skills_qs.count()
        skills = list(skills_qs.values('name', 'category'))

        return Response({
            "users": {
                "total": total_users,
                "active": active_users,
                "students": students,
                "admins": admins,
                "profile_complete": profile_complete,
                "profile_incomplete": profile_incomplete,
                "recent": [
                    {
                        "id": u.pk,
                        "first_name": u.first_name or "",
                        "last_name": u.last_name or "",
                        "email": u.email or "",
                        "role": u.role or "student",
                        "is_active": u.is_active,
                        "is_profile_complete": u.is_profile_complete,
                        "selected_career": u.selected_career or "",
                    }
                    for u in student_qs.order_by("-id")[:10]
                ],
            },
            "total_skills_count": total_skills_count,
            "skills": skills,
            "career_path_distribution": [
                {"career": k, "count": v} for k, v in career_counts.most_common(10)
            ],
            "top_skills": [
                {"skill": s["skill__name"], "count": s["total"]} for s in top_skills
            ],
            "career_paths_detail": career_paths,
        })


class BaseReportView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_filtered_students(self, start_date=None, end_date=None, career=None, search=None):
        from users.models import User as UserModel
        queryset = UserModel.objects.filter(role='student')
        if search:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search)
            )
        if career:
            queryset = queryset.filter(selected_career=career)
        if start_date:
            queryset = queryset.filter(date_joined__gte=start_date)
        if end_date:
            queryset = queryset.filter(date_joined__lte=end_date)
        return queryset

    def get_stats_data(self, start_date=None, end_date=None, career=None, search=None):
        from users.models import User as UserModel

        student_qs = self._get_filtered_students(start_date, end_date, career, search)
        total_users = student_qs.count() + UserModel.objects.filter(role='admin').count()
        active_users = student_qs.filter(is_active=True).count() + UserModel.objects.filter(role='admin', is_active=True).count()
        profile_complete = student_qs.filter(is_profile_complete=True).count()
        profile_incomplete = student_qs.count() - profile_complete
        students = student_qs.count()
        admins = UserModel.objects.filter(role='admin').count()

        from collections import Counter
        career_counts = Counter()
        for u in student_qs:
            if u.selected_career:
                career_counts[u.selected_career] += 1

        career_paths_qs = CareerPath.objects.all()
        if search:
            career_paths_qs = career_paths_qs.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search)
            )
        if start_date:
            career_paths_qs = _safe_date_filter(career_paths_qs, start_date, end_date)

        career_paths = []
        for cp in career_paths_qs:
            required = cp.skills_required if isinstance(cp.skills_required, list) else []
            career_paths.append({
                "title": cp.title,
                "slug": cp.slug,
                "required_skills_count": len(required),
                "required_skills": required,
            })

        top_skills_qs = UserSkill.objects.select_related('skill')
        if start_date:
            top_skills_qs = _safe_date_filter(top_skills_qs, start_date, end_date)
        from django.db.models import Count
        top_skills = top_skills_qs.values('skill__name').annotate(
            total=Count('id')
        ).order_by('-total')[:10]

        skills_qs = Skill.objects.all()
        if search:
            skills_qs = skills_qs.filter(
                models.Q(name__icontains=search) |
                models.Q(category__icontains=search)
            )
        if start_date:
            skills_qs = _safe_date_filter(skills_qs, start_date, end_date)
        total_skills_count = skills_qs.count()
        skills = list(skills_qs.values('name', 'category'))

        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "students": students,
                "admins": admins,
                "profile_complete": profile_complete,
                "profile_incomplete": profile_incomplete,
            },
            "career_path_distribution": [
                {"career": k, "count": v} for k, v in career_counts.most_common(10)
            ],
            "top_skills": [
                {"skill": s["skill__name"], "count": s["total"]} for s in top_skills
            ],
            "career_paths_detail": career_paths,
            "skills": skills,
        }

    def build_pdf(self, buffer, report_type, data, start_date=None, end_date=None):
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=0.5*inch, leftMargin=0.5*inch,
                                topMargin=0.75*inch, bottomMargin=0.75*inch)
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#4F46E5'),
            alignment=TA_CENTER,
            spaceAfter=20
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1F2937'),
            spaceBefore=20,
            spaceAfter=10
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            leading=14
        )

        story = []

        # Logo placeholder
        logo_text = Paragraph("<b>SKILLSYNC</b>", ParagraphStyle(
            'Logo', parent=styles['Heading2'], fontSize=24, textColor=colors.HexColor('#4F46E5'), alignment=TA_CENTER
        ))
        story.append(logo_text)
        story.append(Spacer(1, 5))

        report_titles = {
            'filter': 'Filter Report',
            'summary': 'Summary Report',
            'detailed': 'Detailed Report'
        }
        story.append(Paragraph(report_titles.get(report_type, 'Report'), title_style))
        story.append(Spacer(1, 5))

        date_str = datetime.now().strftime('%B %d, %Y')
        story.append(Paragraph(f"Generated: {date_str}", ParagraphStyle(
            'Date', parent=styles['Normal'], fontSize=9, textColor=colors.gray, alignment=TA_CENTER
        )))

        filter_parts = []
        if start_date:
            filter_parts.append(f"From: {start_date}")
        if end_date:
            filter_parts.append(f"To: {end_date}")
        if career:
            filter_parts.append(f"Career: {career}")
        if search:
            filter_parts.append(f"Search: {search}")
        if filter_parts:
            story.append(Paragraph("Filters Applied: " + " | ".join(filter_parts), ParagraphStyle(
                'Filters', parent=styles['Normal'], fontSize=8, textColor=colors.gray, alignment=TA_CENTER, spaceAfter=5
            )))
            story.append(Spacer(1, 5))
        else:
            story.append(Spacer(1, 20))

        users = data.get('users', {})
        career_dist = data.get('career_path_distribution', [])
        top_skills = data.get('top_skills', [])
        career_paths = data.get('career_paths_detail', [])
        skills = data.get('skills', [])

        if report_type in ['filter', 'summary']:
            story.append(Paragraph("Executive Summary", heading_style))
            
            total_users = users.get('total', 0)
            students = users.get('students', 0)
            active_users = users.get('active', 0)
            profile_complete = users.get('profile_complete', 0)

            story.append(Paragraph(f"<b>Total Users:</b> {total_users}", normal_style))
            story.append(Paragraph(f"<b>Students:</b> {students}", normal_style))
            story.append(Paragraph(f"<b>Active Users:</b> {active_users}", normal_style))
            story.append(Paragraph(f"<b>Profiles Complete:</b> {profile_complete}", normal_style))
            story.append(Spacer(1, 10))

        if report_type in ['filter', 'summary']:
            story.append(Paragraph("Students per Career Path Distribution", heading_style))
            if career_dist:
                table_data = [['Career Path', 'Student Count']]
                for item in career_dist:
                    table_data.append([item['career'], str(item['count'])])
                
                table = Table(table_data, colWidths=[3*inch, 1.5*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
                ]))
                story.append(table)
            else:
                story.append(Paragraph("No career path distribution data available.", normal_style))
            story.append(Spacer(1, 10))

        if report_type in ['filter', 'summary']:
            story.append(Paragraph("Top Skills Distribution", heading_style))
            if top_skills:
                table_data = [['Skill', 'Adoption Count']]
                for item in top_skills[:10]:
                    table_data.append([item['skill'], str(item['count'])])
                
                table = Table(table_data, colWidths=[3*inch, 1.5*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
                ]))
                story.append(table)
            else:
                story.append(Paragraph("No skills data available.", normal_style))
            story.append(Spacer(1, 10))

        if report_type == 'detailed':
            story.append(Paragraph("Detailed Student Distribution by Career Path", heading_style))
            if career_paths:
                table_data = [['Career Path', 'Students', 'Required Skills']]
                for cp in career_paths:
                    student_count = next(
                        (item['count'] for item in career_dist if item['career'] == cp['slug']), 0
                    )
                    table_data.append([
                        cp['title'],
                        str(student_count),
                        str(cp['required_skills_count'])
                    ])
                
                table = Table(table_data, colWidths=[2.5*inch, 1*inch, 1.5*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 9),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
                ]))
                story.append(table)
            else:
                story.append(Paragraph("No career paths data available.", normal_style))
            story.append(Spacer(1, 10))

            story.append(Paragraph("Skills Distribution by Category", heading_style))
            if skills:
                from collections import Counter
                category_counts = Counter(s.get('category', 'Uncategorized') for s in skills)
                table_data = [['Category', 'Skill Count']]
                for cat, count in sorted(category_counts.items()):
                    table_data.append([cat, str(count)])
                
                table = Table(table_data, colWidths=[3*inch, 1.5*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
                ]))
                story.append(table)
            else:
                story.append(Paragraph("No skills data available.", normal_style))
            story.append(Spacer(1, 10))

            story.append(Paragraph("Student Skills Adoption", heading_style))
            if top_skills:
                table_data = [['Rank', 'Skill', 'Students with Skill']]
                for idx, item in enumerate(top_skills[:15], 1):
                    table_data.append([str(idx), item['skill'], str(item['count'])])
                
                table = Table(table_data, colWidths=[0.5*inch, 2.5*inch, 1.5*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 9),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
                ]))
                story.append(table)
            else:
                story.append(Paragraph("No adoption data available.", normal_style))

        doc.build(story, onLaterPages=self._add_footer, onFirstPage=self._add_footer)

    def _add_footer(self, canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.gray)
        canvas.drawCentredString(4*inch, 0.4*inch, 
            f"SKILLSYNC Platform Report - Page {canvas.getPageNumber()} - Generated: {datetime.now().strftime('%Y-%m-%d')}")
        canvas.restoreState()

    def _build_section_pdf(self, buffer, title, sections, filters=None):
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=0.5 * inch, leftMargin=0.5 * inch,
                                topMargin=0.75 * inch, bottomMargin=0.75 * inch)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'CustomTitle', parent=styles['Heading1'], fontSize=18,
            textColor=colors.HexColor('#4F46E5'), alignment=TA_CENTER, spaceAfter=20
        )
        section_heading = ParagraphStyle(
            'SectionHeading', parent=styles['Heading2'], fontSize=13,
            textColor=colors.HexColor('#1F2937'), spaceBefore=16, spaceAfter=8
        )
        normal_style = ParagraphStyle(
            'CustomNormal', parent=styles['Normal'], fontSize=10, leading=14
        )

        story = []
        story.append(Paragraph("<b>SKILLSYNC</b>", ParagraphStyle(
            'Logo', parent=styles['Heading2'], fontSize=24,
            textColor=colors.HexColor('#4F46E5'), alignment=TA_CENTER
        )))
        story.append(Spacer(1, 5))
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 5))

        date_str = datetime.now().strftime('%B %d, %Y')
        story.append(Paragraph(f"Generated: {date_str}", ParagraphStyle(
            'Date', parent=styles['Normal'], fontSize=9,
            textColor=colors.gray, alignment=TA_CENTER
        )))

        if filters:
            filter_parts = []
            if filters.get('start_date'):
                filter_parts.append(f"From: {filters['start_date']}")
            if filters.get('end_date'):
                filter_parts.append(f"To: {filters['end_date']}")
            if filters.get('career'):
                filter_parts.append(f"Career: {filters['career']}")
            if filters.get('search'):
                filter_parts.append(f"Search: {filters['search']}")
            if filter_parts:
                story.append(Paragraph("Filters Applied: " + " | ".join(filter_parts), ParagraphStyle(
                    'Filters', parent=styles['Normal'], fontSize=8,
                    textColor=colors.gray, alignment=TA_CENTER, spaceAfter=5
                )))
        story.append(Spacer(1, 10))

        for sec in sections:
            story.append(Paragraph(sec['heading'], section_heading))

            if sec.get('table_data'):
                table = Table(sec['table_data'], colWidths=sec.get('col_widths'))
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 9),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
                ]))
                story.append(table)
                story.append(Spacer(1, 12))

            if sec.get('paragraphs'):
                for para in sec['paragraphs']:
                    story.append(para)
                story.append(Spacer(1, 12))

            if sec.get('metric_rows'):
                rows = [["Metric", "Count"]] + sec['metric_rows']
                table = Table(rows, colWidths=[3 * inch, 1.5 * inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 9),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
                ]))
                story.append(table)
                story.append(Spacer(1, 12))

        doc.build(story, onLaterPages=self._add_footer, onFirstPage=self._add_footer)
        buffer.seek(0)

        return buffer.getvalue()
    def check_admin(self, request):
        user = request.user
        if not user.is_authenticated:
            return False, Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        is_admin = user.is_staff or user.role == 'admin'
        if not is_admin:
            return False, Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        return True, None


class FilterReportView(BaseReportView):
    def get(self, request):
        is_admin, error = self.check_admin(request)
        if error:
            return error
        data = self.get_stats_data(
            start_date=request.query_params.get('start_date'),
            end_date=request.query_params.get('end_date'),
            career=request.query_params.get('career'),
            search=request.query_params.get('search'),
        )
        buffer = BytesIO()
        self.build_pdf(buffer, 'filter', data,
                       start_date=request.query_params.get('start_date'),
                       end_date=request.query_params.get('end_date'))
        buffer.seek(0)
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="filter-report-{datetime.now().strftime("%Y%m%d")}.pdf"'
        return response


class SummaryReportView(BaseReportView):
    def get(self, request):
        is_admin, error = self.check_admin(request)
        if error:
            return error
        data = self.get_stats_data(
            start_date=request.query_params.get('start_date'),
            end_date=request.query_params.get('end_date'),
            career=request.query_params.get('career'),
            search=request.query_params.get('search'),
        )
        buffer = BytesIO()
        self.build_pdf(buffer, 'summary', data,
                       start_date=request.query_params.get('start_date'),
                       end_date=request.query_params.get('end_date'))
        buffer.seek(0)
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="summary-report-{datetime.now().strftime("%Y%m%d")}.pdf"'
        return response


class DetailedReportView(BaseReportView):
    def get(self, request):
        is_admin, error = self.check_admin(request)
        if error:
            return error
        data = self.get_stats_data(
            start_date=request.query_params.get('start_date'),
            end_date=request.query_params.get('end_date'),
            career=request.query_params.get('career'),
            search=request.query_params.get('search'),
        )
        buffer = BytesIO()
        self.build_pdf(buffer, 'detailed', data,
                       start_date=request.query_params.get('start_date'),
                       end_date=request.query_params.get('end_date'))
        buffer.seek(0)
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="detailed-report-{datetime.now().strftime("%Y%m%d")}.pdf"'
        return response


class SkillGapAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_skills = UserSkill.objects.filter(user=user).select_related('skill')
        selected_career_slug = user.selected_career

        user_skill_map = {}
        for us in user_skills:
            user_skill_map[us.skill.name.lower()] = {
                'proficiency': us.proficiency,
                'category': us.category
            }

        career = None
        missing_skills = []
        matched_skills = []

        if selected_career_slug:
            try:
                career = CareerPath.objects.get(slug=selected_career_slug)
                required_skills = career.skills_required or []

                for req_skill in required_skills:
                    req_name = req_skill.get('name', '').lower() if isinstance(req_skill, dict) else req_skill.lower()
                    req_level = req_skill.get('level', 'Beginner') if isinstance(req_skill, dict) else 'Beginner'

                    if req_name in user_skill_map:
                        user_prof = user_skill_map[req_name]['proficiency']
                        prof_order = {'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4}
                        user_order = prof_order.get(user_prof, 0)
                        req_order = prof_order.get(req_level, 0)

                        if user_order >= req_order:
                            matched_skills.append({
                                'name': req_name,
                                'required_level': req_level,
                                'user_level': user_prof,
                                'status': 'matched'
                            })
                        else:
                            matched_skills.append({
                                'name': req_name,
                                'required_level': req_level,
                                'user_level': user_prof,
                                'status': 'upgrade_needed'
                            })
                    else:
                        missing_skills.append({
                            'name': req_name,
                            'required_level': req_level,
                            'user_level': None,
                            'status': 'missing'
                        })
            except CareerPath.DoesNotExist:
                pass

        total_required = len(missing_skills) + len([s for s in matched_skills if s['status'] in ['matched', 'upgrade_needed']])
        completion_pct = (len([s for s in matched_skills if s['status'] == 'matched']) / total_required * 100) if total_required > 0 else 0

        return Response({
            'career': {
                'title': career.title if career else None,
                'slug': career.slug if career else None,
                'description': career.description if career else None
            },
            'user_skills': [
                {'name': us.skill.name, 'proficiency': us.proficiency, 'category': us.category}
                for us in user_skills
            ],
            'required_skills': career.skills_required if career else [],
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'stats': {
                'total_required': total_required,
                'matched_count': len([s for s in matched_skills if s['status'] == 'matched']),
                'upgrade_count': len([s for s in matched_skills if s['status'] == 'upgrade_needed']),
                'missing_count': len(missing_skills),
                'completion_percentage': round(completion_pct, 1)
            }
        })


class SkillGapReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_skills = UserSkill.objects.filter(user=user).select_related('skill')
        selected_career_slug = user.selected_career

        user_skill_map = {}
        for us in user_skills:
            user_skill_map[us.skill.name.lower()] = {
                'proficiency': us.proficiency,
                'category': us.category
            }

        career = None
        missing_skills = []
        matched_skills = []

        if selected_career_slug:
            try:
                career = CareerPath.objects.get(slug=selected_career_slug)
                required_skills = career.skills_required or []

                for req_skill in required_skills:
                    req_name = req_skill.get('name', '').lower() if isinstance(req_skill, dict) else req_skill.lower()
                    req_level = req_skill.get('level', 'Beginner') if isinstance(req_skill, dict) else 'Beginner'

                    if req_name in user_skill_map:
                        user_prof = user_skill_map[req_name]['proficiency']
                        prof_order = {'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4}
                        user_order = prof_order.get(user_prof, 0)
                        req_order = prof_order.get(req_level, 0)

                        if user_order >= req_order:
                            matched_skills.append({
                                'name': req_name,
                                'required_level': req_level,
                                'user_level': user_prof,
                                'status': 'matched'
                            })
                        else:
                            matched_skills.append({
                                'name': req_name,
                                'required_level': req_level,
                                'user_level': user_prof,
                                'status': 'upgrade_needed'
                            })
                    else:
                        missing_skills.append({
                            'name': req_name,
                            'required_level': req_level,
                            'user_level': None,
                            'status': 'missing'
                        })
            except CareerPath.DoesNotExist:
                pass

        total_required = len(missing_skills) + len([s for s in matched_skills if s['status'] in ['matched', 'upgrade_needed']])
        completion_pct = (len([s for s in matched_skills if s['status'] == 'matched']) / total_required * 100) if total_required > 0 else 0

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=0.5*inch, leftMargin=0.5*inch,
                                topMargin=0.75*inch, bottomMargin=0.75*inch)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#4F46E5'),
            alignment=TA_CENTER,
            spaceAfter=20
        )

        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1F2937'),
            spaceBefore=20,
            spaceAfter=10
        )

        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            leading=14
        )

        story = []
        story.append(Paragraph("<b>SKILLSYNC</b>", ParagraphStyle(
            'Logo', parent=styles['Heading2'], fontSize=24, textColor=colors.HexColor('#4F46E5'), alignment=TA_CENTER
        )))
        story.append(Spacer(1, 5))
        story.append(Paragraph("Skill Gap Analysis Report", title_style))
        story.append(Spacer(1, 5))
        date_str = datetime.now().strftime('%B %d, %Y')
        story.append(Paragraph(f"Generated: {date_str}", ParagraphStyle(
            'Date', parent=styles['Normal'], fontSize=9, textColor=colors.gray, alignment=TA_CENTER
        )))
        story.append(Spacer(1, 20))

        story.append(Paragraph("Career Path", heading_style))
        story.append(Paragraph(f"<b>{career.title if career else 'No career selected'}</b>", normal_style))
        story.append(Spacer(1, 10))

        story.append(Paragraph("Summary", heading_style))
        story.append(Paragraph(f"Completion: {round(completion_pct, 1)}%", normal_style))
        story.append(Paragraph(f"Skills Matched: {len([s for s in matched_skills if s['status'] == 'matched'])}", normal_style))
        story.append(Paragraph(f"Skills Needing Upgrade: {len([s for s in matched_skills if s['status'] == 'upgrade_needed'])}", normal_style))
        story.append(Paragraph(f"Missing Skills: {len(missing_skills)}", normal_style))
        story.append(Spacer(1, 10))

        if matched_skills:
            story.append(Paragraph("Matched Skills", heading_style))
            table_data = [['Skill', 'Required Level', 'Your Level', 'Status']]
            for skill in matched_skills:
                table_data.append([
                    skill['name'].title(),
                    skill['required_level'],
                    skill['user_level'] or '-',
                    'Matched' if skill['status'] == 'matched' else 'Upgrade Needed'
                ])
            table = Table(table_data, colWidths=[1.5*inch, 1*inch, 1*inch, 1*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
            ]))
            story.append(table)
            story.append(Spacer(1, 10))

        if missing_skills:
            story.append(Paragraph("Missing Skills", heading_style))
            table_data = [['Skill', 'Required Level']]
            for skill in missing_skills:
                table_data.append([skill['name'].title(), skill['required_level']])
            table = Table(table_data, colWidths=[2*inch, 1.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
            ]))
            story.append(table)

        doc.build(story, onLaterPages=self._add_footer, onFirstPage=self._add_footer)

        buffer.seek(0)
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="skill-gap-report-{datetime.now().strftime("%Y%m%d")}.pdf"'
        return response

    def _add_footer(self, canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.gray)
        canvas.drawCentredString(4*inch, 0.4*inch, 
            f"SKILLSYNC Platform Report - Page {canvas.getPageNumber()} - Generated: {datetime.now().strftime('%Y-%m-%d')}")
        canvas.restoreState()





class AdminFilteredStatsView(BaseReportView):
    """JSON endpoint returning filtered stats for all three sections in one call."""

    def get(self, request):
        is_admin, error = self.check_admin(request)
        if error:
            return error

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        career = request.query_params.get('career')
        search = request.query_params.get('search')

        from users.models import User as UserModel

        student_qs = self._get_filtered_students(start_date, end_date, career, search)
        students_count = student_qs.count()
        admins_count = UserModel.objects.filter(role='admin').count()
        total = students_count + admins_count
        active_students = student_qs.filter(is_active=True).count()
        active_admins = UserModel.objects.filter(role='admin', is_active=True).count()
        active_total = active_students + active_admins
        profile_complete = student_qs.filter(is_profile_complete=True).count()
        profile_incomplete = students_count - profile_complete

        from collections import Counter
        career_counts = Counter()
        for u in student_qs:
            if u.selected_career:
                career_counts[u.selected_career] += 1

        cp_qs = CareerPath.objects.all()
        if search:
            cp_qs = cp_qs.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search)
            )

        career_paths = []
        for cp in cp_qs:
            required = cp.skills_required if isinstance(cp.skills_required, list) else []
            career_paths.append({
                "title": cp.title,
                "slug": cp.slug,
                "required_skills_count": len(required),
                "required_skills": required,
            })

        skills_qs = Skill.objects.all()
        if search:
            skills_qs = skills_qs.filter(
                models.Q(name__icontains=search) |
                models.Q(category__icontains=search)
            )
        total_skills_count = skills_qs.count()
        skills = list(skills_qs.values('name', 'category'))

        top_skills_qs = UserSkill.objects.select_related('skill')
        if start_date:
            top_skills_qs = _safe_date_filter(top_skills_qs, start_date, end_date)
        from django.db.models import Count
        top_skills = top_skills_qs.values('skill__name').annotate(
            total=Count('id')
        ).order_by('-total')[:10]

        return Response({
            "students": {
                "total": total,
                "count": students_count,
                "admins": admins_count,
                "active": active_total,
                "profile_complete": profile_complete,
                "profile_incomplete": profile_incomplete,
                "active_rate": round((active_total / total * 100) if total else 0),
                "completion_rate": round((profile_complete / students_count * 100) if students_count else 0),
            },
            "careers": {
                "count": len(career_paths),
                "paths": career_paths,
                "distribution": [
                    {"career": k, "count": v} for k, v in career_counts.most_common(10)
                ],
            },
            "skills": {
                "total_count": total_skills_count,
                "list": skills,
                "top_skills_by_adoption": [
                    {"skill": s["skill__name"], "count": s["total"]} for s in top_skills
                ],
            },
            "filters_applied": {
                "start_date": start_date or "",
                "end_date": end_date or "",
                "career": career or "",
                "search": search or "",
            },
        })


class AdminStudentsReportPDFView(BaseReportView):
    """PDF report of the filtered students section."""

    def get(self, request):
        is_admin, error = self.check_admin(request)
        if error:
            return error

        from users.models import User as UserModel

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        career = request.query_params.get('career')
        search = request.query_params.get('search')

        student_qs = self._get_filtered_students(start_date, end_date, career, search)
        students_count = student_qs.count()
        profile_complete = student_qs.filter(is_profile_complete=True).count()
        profile_incomplete = students_count - profile_complete
        active = student_qs.filter(is_active=True).count()
        admins = UserModel.objects.filter(role='admin').count()

        from collections import Counter
        career_counts = Counter()
        for u in student_qs:
            if u.selected_career:
                career_counts[u.selected_career] += 1

        filter_params = {k: v for k, v in request.query_params.items()}
        sections = []

        summary_rows = [
            ["Total Students", str(students_count)],
            ["Total Admins", str(admins)],
            ["Active Students", str(active)],
            ["Profile Complete", str(profile_complete)],
            ["Profile Incomplete", str(profile_incomplete)],
            ["Completion Rate",
             f"{round((profile_complete / students_count * 100) if students_count else 0)}%"],
        ]
        sections.append({'heading': 'Student Summary', 'metric_rows': summary_rows})

        if career_counts:
            cd_rows = [[cp, str(cnt)] for cp, cnt in career_counts.most_common(10)]
            sections.append({
                'heading': 'Students per Career Path',
                'metric_rows': cd_rows,
            })

        top_students = student_qs.order_by('-date_joined')[:50]
        sd_rows = [
            [f"{s.first_name} {s.last_name}", s.email,
             s.selected_career or '-',
             "Yes" if s.is_profile_complete else "No"]
            for s in top_students
        ]
        sections.append({
            'heading': f'Student Details (most recent {min(len(sd_rows), 50)})',
            'table_data': [["Name", "Email", "Career", "Profile Complete"]] + sd_rows,
            'col_widths': [1.5 * inch, 1.7 * inch, 1.5 * inch, 1.3 * inch],
        })

        filename = f"students-report-{datetime.now().strftime('%Y%m%d')}.pdf"
        buffer = BytesIO()
        self._build_section_pdf(buffer, "Students Report", sections, filters=filter_params)

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class AdminSkillsReportPDFView(BaseReportView):
    """PDF report of the filtered skills section."""

    def get(self, request):
        is_admin, error = self.check_admin(request)
        if error:
            return error

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        search = request.query_params.get('search')

        skills_qs = Skill.objects.all()
        if search:
            skills_qs = skills_qs.filter(
                models.Q(name__icontains=search) |
                models.Q(category__icontains=search)
            )
        if start_date:
            skills_qs = _safe_date_filter(skills_qs, start_date, end_date)
        total_skills = skills_qs.count()

        top_skills_qs = UserSkill.objects.select_related('skill')
        if start_date:
            top_skills_qs = _safe_date_filter(top_skills_qs, start_date, end_date)
        from django.db.models import Count
        top_skills = top_skills_qs.values('skill__name').annotate(
            total=Count('id')
        ).order_by('-total')[:15]

        from collections import Counter
        category_counts = Counter(
            s.get('category', 'Uncategorized')
            for s in skills_qs.values('name', 'category')
        )

        filter_params = dict(request.query_params)
        sections = []

        summary_rows = [
            ["Total Skills", str(total_skills)],
            ["Categories", str(len(category_counts))],
            ["Top Skills Tracked", str(min(len(top_skills), 15))],
        ]
        sections.append({'heading': 'Skills Summary', 'metric_rows': summary_rows})

        if category_counts:
            cat_rows = sorted([[cat, str(cnt)] for cat, cnt in category_counts.items()])
            sections.append({
                'heading': 'Skills by Category',
                'metric_rows': cat_rows,
            })

        if top_skills:
            ts_rows = [[s["skill__name"], str(s["total"])] for s in top_skills]
            sections.append({
                'heading': 'Most Popular Skills (by Student Adoption)',
                'metric_rows': ts_rows,
            })

        all_skills = skills_qs.values('name', 'category').order_by('category', 'name')
        sd_rows = [
            [s['name'], s['category'] or 'Uncategorized']
            for s in all_skills
        ]
        sections.append({
            'heading': f'All Skills ({len(sd_rows)})',
            'table_data': [["Skill Name", "Category"]] + sd_rows,
            'col_widths': [3.5 * inch, 2.5 * inch],
        })

        filename = f"skills-report-{datetime.now().strftime('%Y%m%d')}.pdf"
        buffer = BytesIO()
        self._build_section_pdf(buffer, "Skills Analytics Report", sections, filters=filter_params)

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class AdminCareerPathsReportPDFView(BaseReportView):
    """PDF report of the filtered career paths section."""

    def get(self, request):
        is_admin, error = self.check_admin(request)
        if error:
            return error

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        search = request.query_params.get('search')

        cp_qs = CareerPath.objects.all()
        if search:
            cp_qs = cp_qs.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search)
            )
        if start_date:
            cp_qs = _safe_date_filter(cp_qs, start_date, end_date)

        from users.models import User as UserModel
        from collections import Counter
        career_counts = Counter()
        for u in UserModel.objects.filter(role='student'):
            if u.selected_career:
                career_counts[u.selected_career] += 1

        career_paths = []
        student_details = []
        for cp in cp_qs:
            required = cp.skills_required if isinstance(cp.skills_required, list) else []
            sc = career_counts.get(cp.slug, 0)
            career_paths.append({
                "title": cp.title,
                "slug": cp.slug,
                "required_skills_count": len(required),
                "required_skills": required,
            })
            student_details.append((cp.title, cp.slug, sc, len(required)))

        filter_params = dict(request.query_params)
        sections = []

        summary_rows = [
            ["Total Career Paths", str(len(career_paths))],
        ]
        sections.append({'heading': 'Career Paths Summary', 'metric_rows': summary_rows})

        if student_details:
            sd_rows = [(t, slug, str(sc), str(rs)) for t, slug, sc, rs in student_details]
            sections.append({
                'heading': 'Career Path Distribution',
                'table_data': [["Career Path", "Slug", "Students Enrolled", "Required Skills"]] + sd_rows,
                'col_widths': [1.8 * inch, 1.2 * inch, 1.2 * inch, 1.3 * inch],
            })

        if career_paths:
            cp_rows = [[cp['title'], str(cp['required_skills_count'])]
                       for cp in career_paths]
            sections.append({
                'heading': 'Skills Required per Career Path',
                'table_data': [["Career Path", "Required Skills Count"]] + cp_rows,
                'col_widths': [3 * inch, 2 * inch],
            })

        filename = f"careers-report-{datetime.now().strftime('%Y%m%d')}.pdf"
        buffer = BytesIO()
        self._build_section_pdf(buffer, "Career Paths Analytics Report", sections, filters=filter_params)

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


# ─── JSON Section Stats Endpoints ────────────────────────────────────────────

class AdminStudentsStatsView(BaseReportView):
    """JSON stats for the Students page report section."""

    def get(self, request):
        is_admin, error = self.check_admin(request)
        if error:
            return error

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        career = request.query_params.get('career')
        search = request.query_params.get('search')

        from users.models import User as UserModel

        student_qs = self._get_filtered_students(start_date, end_date, career, search)
        students_count = student_qs.count()
        profile_complete = student_qs.filter(is_profile_complete=True).count()
        profile_incomplete = students_count - profile_complete
        active = student_qs.filter(is_active=True).count()
        admins = UserModel.objects.filter(role='admin').count()
        total = students_count + admins

        from collections import Counter
        career_counts = Counter()
        for u in student_qs:
            if u.selected_career:
                career_counts[u.selected_career] += 1

        return Response({
            "students": {
                "count": students_count,
                "admins": admins,
                "total": total,
                "active": active,
                "profile_complete": profile_complete,
                "profile_incomplete": profile_incomplete,
                "completion_rate": round((profile_complete / students_count * 100) if students_count else 0),
                "active_rate": round((active / students_count * 100) if students_count else 0),
            },
            "career_distribution": [
                {"career": k, "count": v} for k, v in career_counts.most_common(10)
            ],
            "recent": [
                {
                    "id": s.pk,
                    "name": f"{s.first_name} {s.last_name}".strip() or "—",
                    "email": s.email or "—",
                    "career": s.selected_career or "—",
                    "profile_complete": s.is_profile_complete,
                }
                for s in student_qs.order_by("-date_joined")[:10]
            ],
            "filters_applied": {
                "start_date": start_date or "",
                "end_date": end_date or "",
                "career": career or "",
                "search": search or "",
            },
        })


class AdminSkillsStatsView(BaseReportView):
    """JSON stats for the Skills page report section."""

    def get(self, request):
        is_admin, error = self.check_admin(request)
        if error:
            return error

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        search = request.query_params.get('search')

        skills_qs = Skill.objects.all()
        if search:
            skills_qs = skills_qs.filter(
                models.Q(name__icontains=search) |
                models.Q(category__icontains=search)
            )
        skills_qs = _safe_date_filter(skills_qs, start_date, end_date)
        total_skills = skills_qs.count()

        from collections import Counter
        category_counts = Counter(
            (s.get('category') or 'Uncategorized')
            for s in skills_qs.values('name', 'category')
        )
        categories_count = len(category_counts)

        top_skills_qs = UserSkill.objects.select_related('skill')
        top_skills_qs = _safe_date_filter(top_skills_qs, start_date, end_date)
        from django.db.models import Count
        top_skills = top_skills_qs.values('skill__name').annotate(
            total=Count('id')
        ).order_by('-total')[:15]

        return Response({
            "skills": {
                "total_count": total_skills,
                "categories_count": categories_count,
            },
            "categories": [
                {"name": cat, "count": cnt}
                for cat, cnt in sorted(category_counts.items())
            ],
            "top_skills": [
                {"name": s["skill__name"], "count": s["total"]}
                for s in top_skills
            ],
            "all_skills": list(skills_qs.values('name', 'category').order_by('category', 'name')),
            "filters_applied": {
                "start_date": start_date or "",
                "end_date": end_date or "",
                "search": search or "",
            },
        })


class AdminCareerPathsStatsView(BaseReportView):
    """JSON stats for the Career Paths page report section."""

    def get(self, request):
        is_admin, error = self.check_admin(request)
        if error:
            return error

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        search = request.query_params.get('search')

        cp_qs = CareerPath.objects.all()
        if search:
            cp_qs = cp_qs.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search)
            )
        cp_qs = _safe_date_filter(cp_qs, start_date, end_date)

        from users.models import User as UserModel
        from collections import Counter
        career_counts = Counter()
        for u in UserModel.objects.filter(role='student'):
            if u.selected_career:
                career_counts[u.selected_career] += 1

        career_paths = []
        for cp in cp_qs:
            required = cp.skills_required if isinstance(cp.skills_required, list) else []
            sc = career_counts.get(cp.slug, 0)
            career_paths.append({
                "title": cp.title,
                "slug": cp.slug,
                "required_skills_count": len(required),
                "required_skills": required,
                "student_count": sc,
            })

        return Response({
            "careers": {
                "total_paths": len(career_paths),
                "total_students": sum(cp["student_count"] for cp in career_paths),
            },
            "paths": career_paths,
            "distribution": [
                {"slug": cp.slug, "title": cp.title, "students": cp["student_count"]}
                for cp in career_paths
            ],
            "filters_applied": {
                "start_date": start_date or "",
                "end_date": end_date or "",
                "search": search or "",
            },
        })

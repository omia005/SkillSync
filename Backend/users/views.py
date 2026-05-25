from rest_framework import views
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from .models import User
from .serializers import UserSerializer, UserCreateSerializer, AdminStudentSerializer
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsAdminUserRole
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import models



# Create your views here.
from rest_framework.permissions import AllowAny

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            refresh = RefreshToken.for_user(user)

            # Inject role and user_id into both tokens
            refresh['user_id'] = user.id
            refresh['role']    = user.role
            access = refresh.access_token
            access['user_id']  = user.id
            access['role']     = user.role

            response = Response({
                "access":  str(access),
                "refresh" : str(refresh),
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": "admin" if user.is_superuser else user.role,
                "is_first_login": user.is_first_login,
            })


            return response

        return Response(serializer.errors, status=400)

    def validate_password(self, request):
        validate_password(request.data["password"])
        return request.data


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.user  # ✅ THIS is the authenticated user

        if user.is_first_login:
            user.is_first_login = False
            user.save()

        tokens = serializer.validated_data
        refresh = tokens.get("refresh")
        access = tokens.get("access")

        # Inject role and user_id into the tokens themselves
        refresh_obj = RefreshToken(refresh)
        refresh_obj['user_id'] = user.id
        refresh_obj['role']    = user.role
        refresh = str(refresh_obj)

        access_obj = AccessToken(access)
        access_obj['user_id'] = user.id
        access_obj['role']    = user.role
        access = str(access_obj)

        res = Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "access": access,
            "refresh": refresh,
            "role": user.role,
            'is_first_login': user.is_first_login,
            'is_profile_complete': user.is_profile_complete
        })

        # In DEBUG (localhost / HTTP) Secure cookies are not sent by browsers
        # that do not support the localhost-exception; disable Secure in dev so
        # the refresh endpoint can successfully read the cookie.
        res.set_cookie(
            key="refresh_token",
            value=refresh,
            httponly=True,
            secure=not settings.DEBUG,   # False in dev, True in production
            samesite="Lax",              # Lax: cookie is still sent on cross-site POSTs (5173→8000) in dev
            path="/api/",
        )

        return res

class CustomRefreshView(TokenRefreshView):

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token is None:
            return Response(
                {"detail": "Refresh token not found"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        request.data["refresh"] = refresh_token

        response = super().post(request, *args, **kwargs)

        # Inject role and user_id into the new access token payload
        try:
            refresh = RefreshToken(request.data["refresh"])
            user_id = refresh.payload.get("user_id")
            user  = User.objects.get(id=user_id)

            new_access = AccessToken(response.data["access"])
            new_access['user_id'] = user.id
            new_access['role']    = user.role
            response.data["access"] = str(new_access)
            response.data["role"]   = user.role
        except Exception:
            pass

        return response


class LogoutView(views.APIView):
    def post(self, request):
        response = Response({"message":"Logged Out"})
        response.delete_cookie("refresh_token")
        return response


class SelectCareerView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        slug = request.data.get("slug")
        
        if slug:
            user.selected_career = slug
            user.save()
            return Response({"message": "Career selected", "slug": slug})
        else:
            user.selected_career = None
            user.save()
            return Response({"message": "Career deselected"})


class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            user = request.user
            user.bio = request.data.get("bio")
            user.linkedIn = request.data.get("linkedIn")
            user.github = request.data.get("github")
            user.portfolio = request.data.get("portfolio")
            user.university = request.data.get("university")
            user.major = request.data.get("major")
            user.graduationYear = request.data.get("graduationYear")
            user.yearOfStudy = request.data.get("yearOfStudy")
            user.first_name = request.data.get("firstName")
            user.last_name = request.data.get("lastName")
            user.profilePicture = request.data.get("profilePicture")
            user.selected_career = request.data.get("selected_career", user.selected_career)

            is_profile_complete = all([
                user.bio,
                user.linkedIn,
                user.github,
                user.portfolio,
                user.university,
                user.major,
                user.graduationYear,
                user.yearOfStudy,
                user.first_name,
                user.last_name,
                user.profilePicture
            ])
            user.is_profile_complete = is_profile_complete
            user.save()
            return Response({"message": "Profile updated successfully"})

        except User.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminDashboardView(views.APIView):
      permission_classes = [IsAdminUserRole, IsAuthenticated]


      def get(self, request):
          return Response({"message": "Welcome Admin!"})


class AdminStudentListView(views.APIView):
    permission_classes = [IsAdminUserRole, IsAuthenticated]

    def get(self, request):
        search = request.GET.get('search', '')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        
        queryset = User.objects.filter(role='student').order_by('-date_joined')
        
        if search:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search)
            )
        
        total_count = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        students = queryset[start:end]
        
        serializer = AdminStudentSerializer(students, many=True)
        
        return Response({
            'students': serializer.data,
            'total': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })


class AdminStudentDetailView(views.APIView):
    permission_classes = [IsAdminUserRole, IsAuthenticated]

    def get(self, request, student_id):
        try:
            student = User.objects.get(id=student_id, role='student')
            serializer = UserSerializer(student)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'detail': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get("email")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # 🔐 Don't reveal if email exists
        return Response(
            {"message": "If this email exists, a reset link has been sent."},
            status=status.HTTP_200_OK
        )

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"

    send_mail(
        subject="Password Reset",
        message=f"Click the link to reset your password:\n{reset_link}",
        from_email="noreply@example.com",
        recipient_list=[email],
    )

    return Response(
        {"message": "Password reset link sent."},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
def reset_password(request, uidb64, token):
    password = request.data.get("password")

    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except:
        return Response(
            {"message": "Invalid link"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not default_token_generator.check_token(user, token):
        return Response(
            {"message": "Token is invalid or expired"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 8:
        return Response(
           {"message": "Password must be at least 8 characters"},
           status=status.HTTP_400_BAD_REQUEST
        )

    user.password = make_password(password)
    user.save()

    return Response(
        {"message": "Password reset successful"},
        status=status.HTTP_200_OK
    )
from rest_framework import views
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User
from .serializers import UserSerializer, UserCreateSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

# Create your views here.
class RegisterView(views.APIView):
    
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        
        if(serializer.is_valid):
          serializer.save()
          tokens = serializer.get_token(User)
          return Response({'user':serializer.data, 'tokens': tokens}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
     
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        data = response.data

        access = data.get("access")
        refresh = data.get("refresh")

        res = Response({"access": access})

        res.set_cookie(
            key = "refresh_token",
            value = refresh,
            httponly= True,
            secure= True,
            samesite="Strict",
            path="api/token/refresh/",
        )

        return res
        
class CustomRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"No refresh token"}, status = status.HTTP_401_UNAUTHORIZED)
        
        request.data["refresh"] = refresh_token
        response = super().post(request, *args, **kwargs)

        return response
    

class LogoutView(views.APIView):
    def post(self, request):
        response = Response({"message":"Logged Out"})
        response.delete_cookie("refresh_token")
        return response


class UserProfileView(views.APIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'




from django.urls import path
from .views import RegisterView, UserProfileView, LogoutView, CustomTokenObtainPairView, CustomRefreshView

urlpatterns = [
   path('register/', RegisterView.as_view(), name = 'register'),
   path('token/', CustomTokenObtainPairView.as_view(), name = 'token_obtain_pair'),
   path('token/refresh/', CustomRefreshView.as_view(), name = 'token_refresh'),
   path('logout/', LogoutView.as_view(), name = 'logout'),
   path('profile/<int:id>/', UserProfileView.as_view(), name = 'user-profile'),
]
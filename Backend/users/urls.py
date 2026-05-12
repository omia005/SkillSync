from django.urls import path
from .views import RegisterView, UserProfileView, LogoutView, CustomTokenObtainPairView, CustomRefreshView, forgot_password, reset_password



urlpatterns = [
   path('register/', RegisterView.as_view(), name = 'register'),
   path('login/', CustomTokenObtainPairView.as_view(), name = 'token_obtain_pair'),
   path('token/refresh/', CustomRefreshView.as_view(), name = 'token_refresh'),
   path('logout/', LogoutView.as_view(), name = 'logout'),
   path('profile/', UserProfileView.as_view(), name = 'user-profile'),
   path('forgot-password/', forgot_password),
   path('reset-password/<uidb64>/<token>/', reset_password),
]
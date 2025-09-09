from django.urls import path
from .views import RegisterView, LoginView, UserProfileView, LogoutView, AvatarUploadView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
        path('profile/avatar/', AvatarUploadView.as_view(), name='avatar-upload'),

    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

from .models import User
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken


class UserSerializer(serializers.ModelSerializer):
   class Meta:
       model =  User
       fields = [
           'id', 'username', 'email', 'first_name', 
           'last_name', 'role', 'bio', 'linkedIn',
           'github', 'portfolio'
           ]

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'password'
        ]
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)

        if password is not None:
            instance.set_password(password)
        instance.save()

        return instance
    
    def get_token(self, User):
        refresh = RefreshToken.for_user(User)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User


SELF_REGISTER_ROLES = {'buyer', 'seller'}


class UserSerializer(serializers.ModelSerializer):
    """Публічний профіль користувача"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'phone', 'city', 'avatar', 'bio', 'created_at',
                  'is_staff', 'is_superuser']
        read_only_fields = ['id', 'email', 'username', 'role', 'created_at', 'is_staff', 'is_superuser']


class RegisterSerializer(serializers.ModelSerializer):
    """Реєстрація нового користувача"""
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2',
                  'first_name', 'last_name', 'role', 'phone']

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Користувач з таким email вже існує')
        return value

    def validate_role(self, value):
        if value not in SELF_REGISTER_ROLES:
            raise serializers.ValidationError('Некоректна роль для реєстрації')
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Паролі не співпадають'})
        data['username'] = data['username'].strip()
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT токен з додатковими даними користувача"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.CharField()
        if 'username' in self.fields:
            del self.fields['username']

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password')

        if email and password:
            user = User.objects.filter(email=email).first()
            if user:
                attrs['username'] = user.username
            else:
                raise serializers.ValidationError({'email': 'Користувача з таким email не знайдено.'})

        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Невірний поточний пароль')
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()

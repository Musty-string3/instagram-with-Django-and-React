from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = get_user_model()
        ## シリアライザーで取得したいデータ
        fields = ("id", "email", "password")
        ## write_onlyやread_onlyの属性を設定できる => GETメソッドで取得した際にユーザーOBJにパスワードは返ってこない
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        ## モデルのUserManagerにあるcreate_userの中を自由に使える
        user = get_user_model().objects.create_user(**validated_data)
        return user


class ProfileSerializer(serializers.ModelSerializer):

    created_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    updated_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = Profile
        fields = ("id", "username", "userProfile", "img", "created_at", "updated_at")
        extra_kwargs = {"userProfile": {"read_only": True}}


class PostSerializer(serializers.ModelSerializer):

    created_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    updated_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)


    class Meta:
        model = Post
        fields = ("id", "title", "text", "userPost", "liked", "img", "created_at", "updated_at")
        extra_kwargs = {"userPost": {"read_only": True}}


class CommentSerializer(serializers.ModelSerializer):

    created_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    updated_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = Comment
        fields = ("id", "text", "userComment", "post", "created_at", "updated_at")
        extra_kwargs = {"userComment": {"read_only": True}}
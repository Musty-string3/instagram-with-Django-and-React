from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings

class UserManager(BaseUserManager):
    def create_user(self, email, password=None):
        """通常のユーザーを作成するメソッド"""
        if not email:
            raise ValueError("email is must")

        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password):
        """スーパーユーザーを作成するメソッド"""
        if not email:
            raise ValueError("email is must")

        user = self.create_user(user, email)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user


class User(AbstractBaseUser, PermissionsMixin):
    """
        AbstractBaseUser を継承してパスワード管理を行う。
        PermissionsMixin を継承して Django の権限管理機能を利用。
    """

    email = models.EmailField(verbose_name="メールアドレス", max_length=50, unique=True)
    is_active = models.BooleanField(verbose_name="サービス利用権限", default=True)
    is_staff = models.BooleanField(verbose_name="スタッフフラグ", default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"

    def __str__(self):
        return self.email

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings


def upload_avatar_path(instance, filename):
    ## ! extには拡張子（jpegやpngが入る）
    ext = filename.split(".")[-1]
    ## ! avatarsというフォルダに「ユーザープロフィールのID + ユーザーネーム + 拡張子」という名前でプロフィール画像のpath名が格納されていく
    return "/".join(["avatars", str(instance.userProfile.id) + str(instance.username) + str(".") + str(ext)])


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
    class Meta:
        verbose_name_plural = '02-01.ユーザー'
        db_table = 'user'

    def __str__(self):
        return self.email

class Profile(models.Model):
    username = models.CharField(verbose_name="ユーザーネーム", max_length=50)
    userProfile = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        verbose_name="ユーザープロフィール",
        on_delete=models.CASCADE,
        related_name="userProfile"
    )
    img = models.ImageField(verbose_name="プロフィール画像", upload_to=upload_avatar_path, blank=True, null=True)
    created_at = models.DateTimeField("作成日時", auto_now_add=False)
    updated_at = models.DateTimeField("変更日時", auto_now=False)

    class Meta:
        verbose_name_plural = '02-02.ユーザープロフィール'
        db_table = 'user'

    def __str__(self):
        return self.username

from django.urls import path
from .views import get_openai_response

urlpatterns = [
    path('api/get_openai_response/', get_openai_response, name='get_openai_response'),
    # 添加其他URL路径和视图函数的映射
]

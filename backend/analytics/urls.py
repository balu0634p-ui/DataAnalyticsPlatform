from django.urls import path

from .views import analytics_api


urlpatterns = [
    path("", analytics_api, name="analytics_api"),
]
from django.urls import path
from ruva.views import HomeView

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
]

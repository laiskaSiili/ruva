from django.urls import path
from ruva.views import *

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
]

from django.urls import path
from ruva.views import *

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('api/tabledata', ApiTableData.as_view(), name='api_table_data')
]

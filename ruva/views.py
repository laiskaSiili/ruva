from django.shortcuts import render
from django.views import View


class HomeView(View):
    def get(self, request):
        ctx = {}
        return render(request, 'ruva/home.html', ctx)
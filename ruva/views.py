from django.core.serializers import serialize
from django.shortcuts import render
from django.views import View
from django.http import HttpResponse, JsonResponse

from ruva.models import Asset, AssetGroup


class HomeView(View):
    def get(self, request):
        ctx = {}
        return render(request, 'ruva/home.html', ctx)

class ApiTableData(View):
    def get(self, request):
        assetgroup = AssetGroup.objects.get(name='test')
        assets = Asset.objects.filter(assetgroup=assetgroup)
        assets_geojson = serialize('geojson', assets,
            geometry_field='geometry', srid=4326, fields=('name', 'cvar'))
        return HttpResponse(assets_geojson)
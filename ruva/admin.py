from django.contrib.gis import admin
from ruva.models import Asset, AssetGroup

class AssetAdmin(admin.GeoModelAdmin):
    pass


class AssetGroupAdmin(admin.GeoModelAdmin):
    pass

admin.site.register(Asset, AssetAdmin)
admin.site.register(AssetGroup, AssetGroupAdmin)
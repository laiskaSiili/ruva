from django.contrib.gis.db import models
# from django.contrib.gis.geos import Point
# Point(0, 0, srid=32140)

class Asset(models.Model):
    name = models.CharField(max_length=40, null=False, blank=False)
    cvar = models.FloatField(null=True, blank=True)
    geometry = models.PointField(null=False, blank=False, srid=4326)
    assetgroup = models.ForeignKey('AssetGroup', on_delete=models.CASCADE, null=True, blank=False)

    def __str__(self):
        return self.name

class AssetGroup(models.Model):
    name = models.CharField(max_length=40, null=False, blank=False)

    def __str__(self):
        return self.name
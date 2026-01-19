# GeoJSON Data Sources for Spain Geography App

This document lists recommended sources for obtaining GeoJSON data for the Spain Geography Quiz App.

## 1. Administrative Boundaries

### GADM (Global Administrative Areas)

- **URL**: <https://gadm.org/download_country.html>
- **Data**: Spain administrative levels (regions, provinces, municipalities)
- **Format**: Shapefile, GeoJSON, KML
- **License**: Free for non-commercial use
- **Notes**: Most comprehensive source for administrative boundaries

### Natural Earth Data

- **URL**: <https://www.naturalearthdata.com/downloads/>
- **Data**: Admin 0 (countries), Admin 1 (states/provinces)
- **Format**: Shapefile, GeoJSON
- **License**: Public Domain
- **Notes**: Good for region-level boundaries, less detailed for municipalities

### OpenStreetMap (via Overpass API)

- **URL**: <https://overpass-turbo.eu/>
- **Query**: Spanish administrative boundaries
- **Format**: GeoJSON
- **License**: ODbL (Open Database License)
- **Example Query**:

```
[out:json][timeout:25];
(
  relation["admin_level"="4"]["ISO3166-1"="ES"];
);
out geom;
```

### INE (Instituto Nacional de Estadística)

- **URL**: <https://www.ine.es/en/dyngs/INEbase/en/operacion.htm?c=Estadistica_C&cid=1254736177031&menu=resultados&idp=1254734710990>
- **Data**: Official Spanish administrative boundaries
- **Format**: Various formats
- **License**: Check terms of use
- **Notes**: Official source, may require account

## 2. Rivers

### Natural Earth Rivers

- **URL**: <https://www.naturalearthdata.com/downloads/10m-physical-vectors/>
- **Data**: Major rivers worldwide (includes Spanish rivers)
- **Format**: Shapefile, GeoJSON
- **License**: Public Domain
- **Notes**: Good for major rivers like Ebro, Tagus, Guadalquivir

### OpenStreetMap (via Overpass API)

- **URL**: <https://overpass-turbo.eu/>
- **Query**: Spanish rivers
- **Format**: GeoJSON
- **License**: ODbL
- **Example Query**:

```
[out:json][timeout:25];
(
  way["waterway"="river"]["name"~"^(Ebro|Tajo|Guadalquivir|Duero)"];
);
out geom;
```

### HydroSHEDS

- **URL**: <https://www.hydrosheds.org/>
- **Data**: Global river networks
- **Format**: Various formats
- **License**: Public Domain
- **Notes**: Detailed river networks, may need processing

## 3. Mountains & Elevation Data

### GeoNames

- **URL**: <http://www.geonames.org/>
- **API**: <http://www.geonames.org/export/web-services.html>
- **Data**: Mountain peaks, elevation points
- **Format**: JSON, XML
- **License**: Creative Commons Attribution
- **Notes**: Good for individual peaks, may need to convert to GeoJSON

### OpenStreetMap (via Overpass API)

- **Query**: Spanish mountains and peaks
- **Example Query**:

```
[out:json][timeout:25];
(
  node["natural"="peak"]["ele"~"."]["name"];
  way["natural"="peak"]["ele"~"."]["name"];
  relation["natural"="peak"]["ele"~"."]["name"];
);
out geom;
```

### Natural Earth Physical Features

- **URL**: <https://www.naturalearthdata.com/downloads/10m-physical-vectors/>
- **Data**: Mountain ranges (generalized)
- **Format**: Shapefile, GeoJSON
- **License**: Public Domain
- **Notes**: Good for major ranges, less detail for individual peaks

### SRTM Data (for elevation contours)

- **URL**: <https://earthexplorer.usgs.gov/>
- **Data**: Elevation data for generating contours
- **Format**: DEM (needs processing)
- **License**: Public Domain
- **Notes**: Requires processing to create GeoJSON contours

## 4. Cities & Points of Interest

### GeoNames

- **URL**: <http://www.geonames.org/>
- **API**: Search for Spanish cities
- **Format**: JSON
- **License**: Creative Commons Attribution
- **Notes**: Comprehensive city database with coordinates

### OpenStreetMap (via Overpass API)

- **Query**: Spanish cities
- **Example Query**:

```
[out:json][timeout:25];
(
  node["place"="city"]["name"];
  node["place"="town"]["name"];
);
out geom;
```

### Natural Earth Populated Places

- **URL**: <https://www.naturalearthdata.com/downloads/10m-cultural-vectors/>
- **Data**: Major populated places
- **Format**: Shapefile, GeoJSON
- **License**: Public Domain
- **Notes**: Good for major cities only

## 5. Lakes & Water Bodies

### OpenStreetMap (via Overpass API)

- **Query**: Spanish lakes and reservoirs
- **Example Query**:

```
[out:json][timeout:25];
(
  way["natural"="water"]["name"];
  relation["natural"="water"]["name"];
);
out geom;
```

### Natural Earth Physical Features

- **URL**: <https://www.naturalearthdata.com/downloads/10m-physical-vectors/>
- **Data**: Major lakes worldwide
- **Format**: Shapefile, GeoJSON
- **License**: Public Domain
- **Notes**: May not include all Spanish lakes

## 6. Coastlines & Islands

### Natural Earth Coastline

- **URL**: <https://www.naturalearthdata.com/downloads/10m-physical-vectors/>
- **Data**: Coastlines worldwide
- **Format**: Shapefile, GeoJSON
- **License**: Public Domain
- **Notes**: Good general coastline data

### OpenStreetMap (via Overpass API)

- **Query**: Spanish islands (Balearic, Canary)
- **Example Query**:

```
[out:json][timeout:25];
(
  relation["place"="island"]["name"];
  relation["place"="archipelago"]["name"];
);
out geom;
```

## 7. Data Processing Tools

### Converting Shapefiles to GeoJSON

- **ogr2ogr** (GDAL): Command-line tool

  ```bash
  ogr2ogr -f GeoJSON output.json input.shp
  ```

- **QGIS**: Desktop GIS software with export to GeoJSON
- **Mapshaper**: Online tool for simplifying GeoJSON
  - URL: <https://mapshaper.org/>

### Simplifying GeoJSON (reducing file size)

- **mapshaper**: Command-line or online

  ```bash
  mapshaper input.json -simplify 10% -o output.json
  ```

- **turf.js**: JavaScript library for GeoJSON processing
  - URL: <https://turfjs.org/>

### Validating GeoJSON

- **GeoJSONLint**: Online validator
  - URL: <https://geojsonlint.com/>
- **geojsonhint**: npm package

  ```bash
  npm install -g @mapbox/geojsonhint
  geojsonhint file.json
  ```

## 8. Recommended Data Collection Workflow

1. **Start with GADM** for administrative boundaries (regions, provinces)
2. **Use Natural Earth** for major physical features (rivers, coastlines)
3. **Supplement with OpenStreetMap** via Overpass API for detailed features
4. **Use GeoNames API** for cities and points of interest coordinates
5. **Process and simplify** GeoJSON files to reduce size
6. **Validate** all GeoJSON files before using in app

## 9. Example Data Structure

Once you have GeoJSON files, organize them like this:

```
data/
  geojson/
    autonomous-regions.geojson    # 17 regions + 2 cities
    provinces.geojson              # 50 provinces
    municipalities.geojson         # Major municipalities (subset)
    rivers.geojson                 # Major rivers
    mountain-ranges.geojson        # Mountain ranges
    mountains.geojson              # Individual peaks
    lakes.geojson                  # Lakes and reservoirs
    islands.geojson                # Balearic and Canary Islands
    coastlines.geojson             # Spanish coastline
```

## 10. API Keys (if needed)

Some services may require API keys:

- **GeoNames**: Free account, daily request limits
- **Google Maps API**: If using for reference (requires key)
- **OpenStreetMap**: No key needed, but respect rate limits

## 11. Licensing Considerations

- **Public Domain**: Natural Earth, some government sources
- **ODbL**: OpenStreetMap (must attribute)
- **Creative Commons**: GeoNames (must attribute)
- **Commercial**: Check individual source terms

Always check licensing terms before using data in your app!

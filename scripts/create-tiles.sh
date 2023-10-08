#!/bin/bash
# Create pmtiles from a database layer from Natural Earth

# Set local variables
user=username # change this
db=dbname
schema=ne
table=ne_10m_admin_0_countries_lakes
out=usa
sql="select * from ne_10m_admin_0_countries_lakes where \"sovereignt\" = 'United States of America'"
mkdir /var/www/html/data/pmtiles/$user

# Create geoJson from db query
echo "Creating geojson..."
ogr2ogr -f geojson  $out.geojson \
    PG:"dbname=$db schemas=$schema tables=$table" \
    -sql "$sql"

# Create mbtiles from geojson
echo "Creating mbtiles..."
tippecanoe -zg -o $out.mbtiles --drop-densest-as-needed --extend-zooms-if-still-dropping $out.geojson

# Create pmtiles from mbtiles
echo "Creating pmtiles..."
pmtiles convert $out.mbtiles $out.pmtiles
ls -lah $out.*
mv $out.pmtiles /var/www/html/data/pmtiles/$user/$out.pmtiles
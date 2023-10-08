out_path=/var/www/html/data/tiles/{addDirPath}
mkdir $out_path
echo generating dem-rgb tiles...
gdal2tiles.py -p mercator -z 1-15 -w all -r cubic -a 0.0 --xyz dem-rgb.tif $out_path/dem_tiles_rgb
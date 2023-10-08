import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";

let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const kyfromabove =
  "https://kygisserver.ky.gov/arcgis/rest/services/WGS84WM_Services/Ky_MultiDirectional_Hillshade_WGS84WM/MapServer/tile/{z}/{y}/{x}";

const hillshade =
  "https://nyc3.digitaloceanspaces.com/astoria/tiles/ky-hillshade/{z}/{x}/{y}.jpg";

const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {
      "usa-pmtiles": {
        type: "vector",
        url: "pmtiles://https://contig.us/data/pmtiles/hawaii/usa.pmtiles",
      },
      "ky-streams": {
        type: "vector",
        url: "pmtiles://https://contig.us/data/pmtiles/ky_strm_line.pmtiles",
      },
      "ky-area": {
        type: "vector",
        url: "pmtiles://https://contig.us/data/pmtiles/ky_strm_area.pmtiles",
      },
      "ky-waterbody": {
        type: "vector",
        url: "pmtiles://https://contig.us/data/pmtiles/ky_strm_waterbody.pmtiles",
      },
      hillshade: {
        type: "raster",
        tiles: [kyfromabove],
        tileSize: 512,
      },
      dem: {
        type: "raster-dem",
        url: "https://contig.us/data/tiles/pine-mtn/terrain.json",
        // url: "terrain.json",
      },
    },
    layers: [
      {
        id: "usa-pmtiles",
        type: "fill",
        source: "usa-pmtiles",
        "source-layer": "usa",
        paint: {
          "fill-color": "#444",
        },
      },
      {
        id: "hillshade",
        type: "raster",
        source: "hillshade",
      },
      {
        id: "ky-streams",
        type: "line",
        source: "ky-streams",
        "source-layer": "ky_strm_line",
        // Filter for above ground streams
        // if the ftype attribute is 460 or 558, show it
        filter: ["any", ["in", "ftype", 460, 558]],
        layout: {
          visibility: "visible",
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#4fa9e9",
          "line-width": 2,
          // Change the opacity of the line based on zoom level
          "line-opacity": [
            // Linearly interpolate between zoom level 12 and 13
            "interpolate",
            ["linear"],
            ["zoom"],
            // z12 is 0 opacity, z13 is 1 opacity
            12,
            0,
            13,
            1,
          ],
        },
      },
      {
        id: "ky-area",
        type: "fill",
        source: "ky-area",
        "source-layer": "ky_strm_area",
        layout: {
          visibility: "visible",
        },
        paint: {
          // Match the ftype attribute
          // 403 is inundation area, make it lighter blue
          // else make it the common blue
          "fill-color": ["match", ["get", "ftype"], 403, "#8cc4e7", "#4fa9e9"],
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1],
        },
      },
      {
        id: "ky-waterbody",
        type: "fill",
        source: "ky-waterbody",
        "source-layer": "ky_strm_waterbody",
        layout: {
          visibility: "visible",
        },
        paint: {
          "fill-color": "#4fa9e9",
          // In the case that the area is less than 0.05 sqkm,
          // set the opacity to 0, else set to 1
          "fill-opacity": ["case", ["<", ["get", "areasqkm"], 0.05], 0, 1],
        },
      },
      {
        id: "ky-ponds",
        type: "fill",
        source: "ky-waterbody",
        "source-layer": "ky_strm_waterbody",
        // Filter for any waterbody that is less than 0.05 sqkm
        filter: ["any", ["<=", "areasqkm", 0.05]],
        layout: {
          visibility: "visible",
        },
        paint: {
          "fill-color": "#4fa9e9",
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 13, 1],
        },
      },
    ],
  },
  center: [-85, 38],
  zoom: 12,
  hash: true,
});

map.on("click", function (e) {
  var features = map.queryRenderedFeatures(e.point);

  // Limit the number of properties we're displaying for
  // legibility and performance
  var displayProperties = [
    "type",
    "properties",
    "id",
    "layer",
    "source",
    "sourceLayer",
    "state",
  ];

  var displayFeatures = features.map(function (feat) {
    var displayFeat = {};
    displayProperties.forEach(function (prop) {
      displayFeat[prop] = feat[prop];
    });
    return displayFeat;
  });

  const txt = JSON.stringify(displayFeatures, null, 2);
  console.log(txt);
});

map.on("load", function () {
  map.setTerrain({
    source: "dem",
    // exaggeration: 2, // for Terrarium
    exaggeration: 0.0005, // for self-hosted terrain
  });
});

import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Style, Circle, Fill, Stroke } from 'ol/style';

proj4.defs("EPSG:31370","+proj=lcc +lat_0=90 +lon_0=4.36748666666667 +lat_1=51.1666672333333 +lat_2=49.8333339 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.8686,52.2978,-103.7239,-0.3366,0.457,-1.8422,-1.2747 +units=m +no_defs +type=crs");

register(proj4);

const grandPlace = [148866.0, 170691.0];

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    projection: 'EPSG:31370',
    center: grandPlace,
    zoom: 16,
  }),
});

const pointSource = new VectorSource();
const pointLayer = new VectorLayer({
  source: pointSource,
  style: new Style({
    image: new Circle({
      radius: 5,
      fill: new Fill({
        color: 'yellow',
      }),
      stroke: new Stroke({
        color: 'black',
        width: 2,
      })
    })
  })
});

map.addLayer(pointLayer);

fetch('/ambulance1.json')
    .then(async response => {
        const file = await response.json();
        const data = file.data;

        for (const item of data) {
          const x = item.x;
          const y = item.y;

          const ambulancePoint = new Point([x, y]);
          const ambulanceFeature = new Feature({ geometry: ambulancePoint });
          pointSource.addFeature(ambulanceFeature);
        }
    })

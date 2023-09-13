import proj4 from 'proj4';

import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { register } from 'ol/proj/proj4';
import { LineString, Point } from 'ol/geom';
import { Feature } from 'ol';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { buffer } from 'ol/extent';
import { Coordinate } from 'ol/coordinate';

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
    zoom: 2,
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

const lineSource = new VectorSource();

const lineLayer = new VectorLayer({
  source: lineSource,
});

map.addLayer(lineLayer);

fetch('/ambulance1.json')
    .then(async response => {
        const file = await response.json();
        const data = file.data;
        const coordinates: Coordinate[] = [];

        for (const item of data) {
          const x = Number.parseFloat(item.x);
          const y = Number.parseFloat(item.y);

          coordinates.push([x, y]);
          const ambulancePoint = new Point([x, y]);
          const ambulanceFeature = new Feature({ geometry: ambulancePoint });
          pointSource.addFeature(ambulanceFeature);
        }

        const polyLine = new LineString(coordinates);
        const trajet = new Feature({ geometry: polyLine });

        lineSource.addFeature(trajet);

        const extent = pointSource.getExtent();
        const bufferedExtent = buffer(extent, 500);

        map.getView().fit(bufferedExtent);
    })

import proj4 from 'proj4';

import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { register } from 'ol/proj/proj4';
import { LineString, Point } from 'ol/geom';
import { Feature, Overlay } from 'ol';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Style, Circle, Fill, Stroke, Text } from 'ol/style';
import { buffer } from 'ol/extent';
import { Coordinate } from 'ol/coordinate';
import { FeatureLike } from 'ol/Feature';
import TileWMS from 'ol/source/TileWMS';
import WMTS, { Options, optionsFromCapabilities} from 'ol/source/WMTS.js';
import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import Modify from 'ol/interaction/Modify';

proj4.defs("EPSG:31370","+proj=lcc +lat_0=90 +lon_0=4.36748666666667 +lat_1=51.1666672333333 +lat_2=49.8333339 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.8686,52.2978,-103.7239,-0.3366,0.457,-1.8422,-1.2747 +units=m +no_defs +type=crs");

register(proj4);

const wmtsCapabilitiesUrl = 'https://geoservices-urbis.irisnet.be/geoserver/gwc/service/wmts?REQUEST=GetCapabilities';

const grandPlace = [148866.0, 170691.0];

const osm = new TileLayer({
  source: new OSM(),
});

const wmsLayer = new TileLayer({
  source: new TileWMS({
    projection: 'EPSG:31370',
    url: 'https://geoservices-urbis.irisnet.be/geoserver/ows',
    params: {
      'LAYERS': 'urbisFR',
      'SRS': 'EPSG:31370',
    },
  }),
});

const map = new Map({
  layers: [osm],
  target: 'map',
  view: new View({
    projection: 'EPSG:31370',
    center: grandPlace,
    zoom: 2,
  }),
});


// fetch(wmtsCapabilitiesUrl)
//   .then(response => {
//     return response.text();
//   }).then(text => {
//     const parser = new WMTSCapabilities();
//     const result = parser.read(text);
//     const layerName = 'urbisFR';
//     const tileMatrixSet = 'EPSG:31370';

//     const options = optionsFromCapabilities(result, {
//       layer: layerName,
//       matrixSet: tileMatrixSet
//     });

//     const wmtsSource = new WMTS(options as Options);

//     const wmtsLayer = new TileLayer({
//       source: wmtsSource
//     });

//     map.addLayer(wmtsLayer);
//   })

function getColorFromStatus(status: number) {
  switch (status) {
    case 0: return 'blue';
    case 1: return 'green';
    case 2: return 'yellow';
    case 3: return 'orange';
    case 4: return 'cyan';
    case 5: return 'gray';
    case 6: return 'white';
    case 7: return 'purple';
  }
}

function getStyleFromStatus(feature: FeatureLike) {
  const statusText = feature.get('status');
  const status = Number.parseInt(statusText);
  const fillColor = getColorFromStatus(status);

  return new Style({
    image: new Circle({
      radius: 5,
      fill: new Fill({
        color: fillColor,
      }),
      stroke: new Stroke({
        color: 'black',
        width: 2,
      })
    })
  })
}

const pointSource = new VectorSource();
const pointLayer = new VectorLayer({
  source: pointSource,
  style: getStyleFromStatus,
});

const lineSource = new VectorSource();

const lineStyles = [
  new Style({
    stroke: new Stroke({
      width: 5,
      color: 'blue',
    })
  }),
  new Style({
    stroke: new Stroke({
      width: 2,
      color: 'white',
    }),
  })
]

const lineLayer = new VectorLayer({
  source: lineSource,
  style: lineStyles,
});

const vehicleSource = new VectorSource();

const statusTexts = [
  'call',
  'alarm',
  'departure',
  'arrival',
  'dep.hosp.',
  'arr.hosp.',
  'return',
  'garage'
]

const vehicleLayer = new VectorLayer({
  source: vehicleSource,
  style: (feature) => new Style({
    text: new Text({
      text: `status: ${statusTexts[feature.get('status')]}\nspeed: ${feature.get('speed')} km/h`,
      scale: 2,
      offsetX: 30,
      textAlign: 'start',
      stroke: new Stroke({
        color: 'white',
        width: 2,
      })
    }),
    image: new Circle({
      radius: 10,
      fill: new Fill({
        color: getColorFromStatus(feature.get('status')),
      }),
      stroke: new Stroke({
        color: 'black',
        width: 2,
      })
    })
  })
})

function getColorFromSpeed(speed: number) {
  if (speed === 0) {
    return 'red';
  }
  if (speed < 15) {
    return 'orange';
  }
  if (speed < 20) {
    return 'yellow';
  }
  return 'green';
}

const lineSegmentSource = new VectorSource();

function getLineSegmentStyle(feature: Feature) {
  const styles: Style[] = [];

  const colorSegment = new Style({
    stroke: new Stroke({
      color: getColorFromSpeed(feature.get('speed')),
      width: 4,
    })
  });

  styles.push(colorSegment);

  if (feature.get('selected')) {
    const selectedSegment = new Style({
      stroke: new Stroke({
        width: 10,
        color: 'cyan',
      }),
    });

    styles.push(selectedSegment);
  }

  return styles;
}

const lineSegmentLayer = new VectorLayer({
  source: lineSegmentSource,
  style: getLineSegmentStyle,
});

map.addLayer(lineLayer);
// map.addLayer(pointLayer);
// map.addLayer(lineSegmentLayer);
map.addLayer(vehicleLayer);

function moveVehicle(feature: Feature, features: Feature[]) {
  const interval = 100;
  let index = 0;
  let now = performance.now();

  function update() {
    const now2 = performance.now();

    if (now2 - now >= 300) {
      const currentFeature = features[index];
      const currentPoint = currentFeature.getGeometry() as Point;
      const coordinate = currentPoint.getFirstCoordinate();
      index++;
      const point = feature.getGeometry() as Point;
      point.setCoordinates(coordinate);
      feature.set('speed', currentFeature.get('speed'));
      feature.set('status', currentFeature.get('status'));
      now = now2;
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

fetch('/ambulance1.json')
    .then(async response => {
        const file = await response.json();
        const data = file.data;
        const coordinates: Coordinate[] = [];
        const pointFeatures: Feature[] = [];

        let previousX = null;
        let previousY = null;

        for (let i = 0; i < data.length; i++) {
          const item = data[i];

          const x = Number.parseFloat(item.x);
          const y = Number.parseFloat(item.y);

          if (previousX != null
            && x === previousX
            && previousY != null
            && y === previousY) {
              previousX = x;
              previousY = y;
            continue;
          }

          previousX = x;
          previousY = y;

          coordinates.push([x, y]);
          const ambulancePoint = new Point([x, y]);

          // "timedate": "2022-09-06 09:50:40",
          // "status": "2",
          // "speed": "0"

          const speed = Number.parseFloat(item.speed);
          const status = Number.parseInt(item.status);
          const timedate = item.timedate;

          if (speed <= 0) {
            continue;
          }

          const ambulanceFeature = new Feature({ geometry: ambulancePoint });

          ambulanceFeature.set('speed', speed);
          ambulanceFeature.set('status', status);
          ambulanceFeature.set('timedate', timedate);

          pointSource.addFeature(ambulanceFeature);
          pointFeatures.push(ambulanceFeature);

          if (i < data.length - 1) {
            const next = data[i + 1];

            const x2 = Number.parseFloat(next.x);
            const y2 = Number.parseFloat(next.y);

            const segment = new LineString([
              [x, y],
              [x2, y2],
            ]);

            const speed2 = Number.parseFloat(next.speed);

            const segmentFeature = new Feature({ geometry: segment });

            const averageSpeed = Math.max(speed, speed2);

            segmentFeature.set('speed', averageSpeed);

            lineSegmentSource.addFeature(segmentFeature);
          }
        }

        const polyLine = new LineString(coordinates);
        const trajet = new Feature({ geometry: polyLine });

        // On ajoute la ligne à la source
        lineSource.addFeature(trajet);

        const vehicle = new Feature({
          geometry: new Point(coordinates[0]),
        });

        vehicleSource.addFeature(vehicle);

        const extent = pointSource.getExtent();
        const bufferedExtent = buffer(extent, 500);

        map.getView().fit(bufferedExtent);

        const overlay = new Overlay({
          element: document.getElementById('segment-overlay') as HTMLElement,
        })

        map.addOverlay(overlay);

        function onClick(event) {
            const feature = lineSegmentSource.getClosestFeatureToCoordinate(event.coordinate);
            lineSegmentSource.forEachFeature(f => {
              f.set('selected', false, true);
            })
            if (feature) {
              const x = event.coordinate[0];
              const y = event.coordinate[1];

              const closest = feature.getGeometry()?.getClosestPoint(event.coordinate) as Coordinate;

              const x2 = closest[0];
              const y2 = closest[1];

              const xDist = x2 - x;
              const yDist = y2 - y;
              const distance = Math.sqrt(xDist * xDist + yDist * yDist);

              if (distance <= 100) {
                feature.set('selected', true, true);
                overlay.setPosition(event.coordinate);
                const overlayElement = overlay.getElement();

                overlayElement.children[0].innerText = `speed: ${feature.get('speed')} km/h`;
                overlayElement.children[1].innerText = `http://belgique.com`;
              } else {
                overlay.setPosition(undefined);
              }
            }

            lineSegmentLayer.changed();
        }

        lineSegmentSource.on('changefeature', () => console.log('change'));

        map.on('click', onClick);

        function getEditionPointStyle(feature) {
        }

        const modify = new Modify({
          source: lineSource,
          insertVertexCondition: () => false,
          style: (feature) => new Style({
            image: new Circle({
              radius: 20,
              fill: new Fill({
                color: 'red',
              })
            })
          })
        });

        map.addInteraction(modify);

        moveVehicle(vehicle, pointFeatures);
    })

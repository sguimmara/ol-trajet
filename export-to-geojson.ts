import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import OSM from 'ol/source/OSM';
import Draw from 'ol/interaction/Draw';
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Circle, Fill, Stroke, Style } from "ol/style";
import GeoJSON from 'ol/format/GeoJSON';

const osm = new TileLayer({
    source: new OSM(),
});

const map = new Map({
    layers: [osm],
    target: "map",
    view: new View({
        center: fromLonLat([4.3525, 50.846667]),
        zoom: 15,
    })
})

const source = new VectorSource();

const vectorLayer = new VectorLayer({
    source,
    style: new Style({
        image: new Circle({
            radius: 10,
            fill: new Fill({
                color: 'red',
            }),
            stroke: new Stroke({
                color: 'black',
            })
        })
    })
});

map.addLayer(vectorLayer);

const draw = new Draw({
    type: 'Point',
    source,
})

map.addInteraction(draw);

const button = document.getElementById('export') as HTMLButtonElement;

button.onclick = function exportFeatures() {
    const encoder = new GeoJSON({
        featureProjection: 'EPSG:3857',
        dataProjection: 'EPSG:4326',
    });

    const geojson = encoder.writeFeatures(source.getFeatures());

    console.log(geojson);

    fetch('http://belgique.com', {
        method: 'POST',
        body: new TextEncoder().encode(geojson),
    })
}
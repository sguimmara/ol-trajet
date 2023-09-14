import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import OSM from 'ol/source/OSM';

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
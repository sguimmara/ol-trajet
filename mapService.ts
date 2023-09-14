import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import { config } from "./configuration";
import VectorSource from "ol/source/Vector";
import Draw from "ol/interaction/Draw";
import { Type as GeometryType } from "ol/geom/Geometry";
import {Heatmap as HeatmapLayer} from 'ol/layer';
import { Point } from "ol/geom";

const osm = new TileLayer({
    source: new OSM(),
});

const map = new Map({
    layers: [osm],
    target: "map",
    view: new View({
        center: fromLonLat(config.center),
        zoom: config.zoom,
    })
})

export function addCircleVectorLayer(source: VectorSource<Point>) {
    const layer = new HeatmapLayer({
        source,
        blur: 30,
        radius: 10,
    })

    layer.setGradient(['red', 'purple', 'white']);

    map.addLayer(layer);

    source.on('addfeature', (event) => {
        event.feature?.set('weight', 1);
    })

    return layer;
}

export function addDrawInteraction(source: VectorSource, type: GeometryType) {
    const draw = new Draw({
        type,
        source,
    })

    map.addInteraction(draw);
}
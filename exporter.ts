import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";

function exportFeatures(source: VectorSource, url: string) {
    const encoder = new GeoJSON({
        featureProjection: 'EPSG:3857',
        dataProjection: 'EPSG:4326',
    });

    const geojson = encoder.writeFeatures(source.getFeatures());

    console.log(geojson);

    fetch(url, {
        method: 'POST',
        body: new TextEncoder().encode(geojson),
    })
}

export { exportFeatures }
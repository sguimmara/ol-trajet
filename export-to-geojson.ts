import VectorSource from "ol/source/Vector";
import * as exporter from "./exporter";
import * as mapService from './mapService';

const source = new VectorSource();

mapService.addCircleVectorLayer(source);

mapService.addDrawInteraction(source, 'Point');

// const button = document.getElementById('export') as HTMLButtonElement;

// const canvas = document.getElementsByTagName('canvas').item(0) as HTMLCanvasElement;

// const context = canvas?.getContext('2d');

// const imageData = context?.getImageData(0, 0, canvas.width, canvas.height) as ImageData;

// createImageBitmap(imageData).then(image => {
//     const htmlImage = new Image(image.width, image.height);
// })

// button.onclick = () => exporter.exportFeatures(source, 'http://belgique.com');
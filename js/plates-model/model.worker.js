import loadModel from './load-model';
import renderTopView from './render-top-view';
import renderCrossSection from './render-cross-section';

let model = null;
let input = null;
let topViewImgData = null;
let crossSectionImgData = null;

function calcTopViewImgData() {
  const { platesRendering, plateBoundariesRendering } = input;
  const imgData = topViewImgData;
  renderTopView(imgData, model.points, platesRendering ? 'plates' : 'height', plateBoundariesRendering);
  return imgData;
}

function calcCrossSectionImgData() {
  const { platesRendering, crossY } = input;
  const imgData = crossSectionImgData;
  renderCrossSection(imgData, model.points, crossY, platesRendering ? 'plates' : 'type');
  return imgData;
}

function calcHotSpotsData() {
  return model.hotSpots.map(hs => ({ x: hs.x, y: hs.y, radius: hs.radius }));
}

function workerFunction() {
  const output = {};
  if (input.simEnabled) {
    model.step();
    output.topViewImgData = calcTopViewImgData();
    output.crossSectionImgData = calcCrossSectionImgData();
    if (input.hotSpotsRendering) {
      output.hotSpots = calcHotSpotsData();
    }
  }
  postMessage({ type: 'output', output });
}

onmessage = function modelWorkerMsgHandler(event) {
  const data = event.data;
  if (data.type === 'load') {
    model = loadModel(data.imageData, data.presetName);
    topViewImgData = data.topViewImgData;
    crossSectionImgData = data.crossSectionImgData;
    input = data.input;
    setInterval(workerFunction, 1);
  } else if (data.type === 'input') {
    input = data.input;
  }
};

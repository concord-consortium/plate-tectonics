import loadModel from './load-model';
import renderTopView from './render-top-view';
import renderCrossSection from './render-cross-section';

let model = null;
let newInput = null;
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
  // Note that it can be optimized later in case of need. We could compare newInput with old input values and decide
  // which output values need to be recalculated. But for now it's fine to always rectalculate the whole output.
  let recalcOutput = false;
  if (newInput) {
    input = newInput;
    newInput = null;
    recalcOutput = true;
  }
  if (input.simEnabled) {
    model.step();
    recalcOutput = true;
  }
  if (recalcOutput) {
    const output = {};
    output.topViewImgData = calcTopViewImgData();
    output.crossSectionImgData = calcCrossSectionImgData();
    if (input.hotSpotsRendering) {
      output.hotSpots = calcHotSpotsData();
    }
    postMessage({ type: 'output', output });
  }
}

onmessage = function modelWorkerMsgHandler(event) {
  const data = event.data;
  if (data.type === 'load') {
    model = loadModel(data.imageData, data.presetName);
    topViewImgData = data.topViewImgData;
    crossSectionImgData = data.crossSectionImgData;
    newInput = data.input;
    setInterval(workerFunction, 0);
  } else if (data.type === 'input') {
    newInput = data.input;
  }
};

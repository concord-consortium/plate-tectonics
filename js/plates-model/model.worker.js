import loadModel from './load-model';
import renderTopView from './render-top-view';
import renderHotSpots from './render-hot-spots';
import renderCrossSection from './render-cross-section';

let model = null;
let input = null;
let topViewImgData = null;
let crossSectionImgData = null;

function calcTopViewImgData() {
  const { platesRendering, plateBoundariesRendering, hotSpotsRendering } = input;
  const imgData = topViewImgData;
  renderTopView(imgData, model.points, platesRendering ? 'plates' : 'height', plateBoundariesRendering);
  if (hotSpotsRendering) {
    renderHotSpots(imgData, model.hotSpots);
  }
  return imgData;
}

function calcCrossSectionImgData() {
  const { platesRendering, crossY } = input;
  const imgData = crossSectionImgData;
  renderCrossSection(imgData, model.points, crossY, platesRendering ? 'plates' : 'type');
  return imgData;
}

function calcOutput() {
  return {
    topViewImgData: calcTopViewImgData(),
    crossSectionImgData: calcCrossSectionImgData(),
  };
}

function workerFunction() {
  if (input.simEnabled) {
    model.step();
    postMessage({ type: 'output', output: calcOutput() });
  }
}

onmessage = function modelWorkerMsgHandler(event) {
  const data = event.data;
  if (data.type === 'load') {
    model = loadModel(data.imageData, data.presetName);
    topViewImgData = data.topViewImgData;
    crossSectionImgData = data.crossSectionImgData;
    input = data.input;
    setInterval(workerFunction, 0);
  } else if (data.type === 'input') {
    input = data.input;
  }
};

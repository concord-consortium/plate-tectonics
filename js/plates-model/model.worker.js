import loadModel from './load-model';
import renderTopView from './render-top-view';
import renderHotSpots from './render-hot-spots';
import renderCrossSection from './render-cross-section';

let model = null;
let topViewImgData = null;
let crossSectionImgData = null;

function stepHandler(model) {
  model.step();
  postMessage({ type: 'stepDone' });
}

function renderTopViewHandler(model, data) {
  const { platesRendering, plateBoundariesRendering, hotSpotsRendering } = data;
  const imgData = topViewImgData;
  renderTopView(imgData, model.points, platesRendering ? 'plates' : 'height', plateBoundariesRendering);
  if (hotSpotsRendering) {
    renderHotSpots(imgData, model.hotSpots);
  }
  postMessage({ type: 'topViewImgData', imgData });
}

function renderCrossSectionHandler(model, data) {
  const { platesRendering, crossY } = data;
  const imgData = crossSectionImgData;
  renderCrossSection(imgData, model.points, crossY, platesRendering ? 'plates' : 'type');
  postMessage({ type: 'crossSectionImgData', imgData });
}

onmessage = function modelWorkerMsgHandler(event) {
  const data = event.data;
  if (data.type === 'load') {
    model = loadModel(data.imageData, data.presetName);
    topViewImgData = data.topViewImgData;
    crossSectionImgData = data.crossSectionImgData;
  } else if (data.type === 'step') {
    stepHandler(model);
  } else if (data.type === 'renderTopView') {
    renderTopViewHandler(model, data);
  } else if (data.type === 'renderCrossSection') {
    renderCrossSectionHandler(model, data);
  }
};

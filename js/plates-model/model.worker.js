import Model from './model';
import { getPlates } from './img-2-plates';

let model = null;

function loadModel(data) {
  model = new Model({ plates: getPlates(data.heightMap), width: data.width, height: data.height });
}

onmessage = function (event) {
  if (event.data.type === 'load') {
    loadModel(event.data.model);
    postMessage({
      type: 'loaded',
      height: model.height,
      width: model.width,
      points: model.points,
    });
  } else if (event.data.type === 'step') {
    model.step();
    postMessage({
      type: 'step',
      points: model.points,
    });
  }
};

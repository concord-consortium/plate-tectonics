import Model from './model';
import * as presets from './presets';

export default function loadModel(presetName, callback) {
  if (presets[presetName]) {
    presets[presetName]((plates, width, height) => {
      callback(new Model({ width, height, plates }));
    });
  }
}

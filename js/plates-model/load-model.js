import Model from './model';
import * as scriptPresets from './presets/scripts';
import * as imgPresets from './presets/images';

const DEF_WIDTH = 512;
const DEF_HEIGHT = 512;

export default function loadModel(presetName, callback) {
  // Try to load models using presets based on scripts or presets based on images.
  if (scriptPresets[presetName]) {
    const width = DEF_WIDTH;
    const height = DEF_HEIGHT;
    const plates = scriptPresets[presetName](width, height);
    callback(new Model({ width, height, plates }));
  } else if (imgPresets[presetName]) {
    imgPresets[presetName]((plates, width, height) => {
      callback(new Model({ width, height, plates }));
    });
  }
}

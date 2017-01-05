import Model from './model';
import presets from './presets';
import imgData2plates from './img-data-2-plates';

export default function loadModel(imageData, presetName) {
  const plates = imgData2plates(imageData);
  presets[presetName].init(plates);
  return new Model({ plates, width: imageData.width, height: imageData.height });
}

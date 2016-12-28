import Model from './model';
import presets from './presets';
import img2plates from './img-2-plates';

export default function loadModel(presetName, callback) {
  const preset = presets[presetName];
  if (!preset) return;
  img2plates(preset.img, (plates, width, height) => {
    preset.init(plates);
    callback(new Model({ plates, width, height }));
  });
}

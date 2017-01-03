import presets from './presets';
import { img2heightMap } from './img-2-plates';

export default function loadModel(presetName, callback) {
  const preset = presets[presetName];
  if (!preset) return;
  img2heightMap(preset.img, (heightMap, width, height) => {
    callback({ heightMap, width, height });
  });
}

import bs from 'binarysearch';
import config from './config';
import { OCEAN, CONTINENT } from './point';

const COLORS = {
  nothing: [220, 220, 220],
  water: [2, 156, 212],
  [CONTINENT]: [128, 128, 128],
  [OCEAN]: [64, 64, 64],
};

function normalizedHeight(val) {
  return (val - config.minHeight) / (config.maxHeight - config.minHeight);
}

export default function renderCrossSection(canvas, points, crossSectionY) {
  const maxX = points.length;
  if (maxX !== canvas.width) {
    throw new Error('Data has to have the same width as canvas');
  }
  const ctx = canvas.getContext('2d');
  const canvHeight = canvas.height;
  const imageData = ctx.createImageData(canvas.width, canvas.height);

  const heightData = [];
  for (let x = 0; x < maxX; x += 1) {
    const h = (points[x][crossSectionY] || []).map(point => canvHeight - canvHeight * normalizedHeight(point.height));
    heightData.push(h);
  }
  const waterLevel = canvHeight - canvHeight * normalizedHeight(config.waterLevel);

  for (let x = 0; x < maxX; x += 1) {
    for (let y = 0; y < canvHeight; y += 1) {
      const idx = (y * maxX + x) * 4;
      let color = y < waterLevel ? COLORS.nothing : COLORS.water;
      if (y >= heightData[x][0]) {
        const pointIdx = bs.closest(heightData[x], y);
        color = COLORS[points[x][y][pointIdx].type];
      }
      imageData.data[idx] = color[0];
      imageData.data[idx + 1] = color[1];
      imageData.data[idx + 2] = color[2];
      imageData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

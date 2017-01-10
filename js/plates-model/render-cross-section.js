import bs from 'binarysearch';
import config from './config';
import { OCEAN, CONTINENT } from './point';
import { plateColor } from './colormaps';

const COLORS = {
  nothing: [220, 220, 220],
  water: [2, 156, 212],
  [CONTINENT]: [128, 128, 128],
  [OCEAN]: [64, 64, 64],
};

function normalizedHeight(val) {
  return (val - config.astenosphereBottom) / (config.maxHeight - config.astenosphereBottom);
}

export default function renderCrossSection(imageData, points, crossSectionY, mode = 'type') {
  const maxX = points.length;
  if (maxX !== imageData.width) {
    throw new Error('Data has to have the same width as canvas');
  }
  const canvHeight = imageData.height;

  const heightData = [];
  const bottom = [];
  const crossSectionPoints = [];
  for (let x = 0; x < maxX; x += 1) {
    const h = (points[x][crossSectionY] || []).map(point => canvHeight - canvHeight * normalizedHeight(point.height));
    heightData.push(h);
    const b = (points[x][crossSectionY] || []).map(point => canvHeight - canvHeight * normalizedHeight(point.bottom));
    bottom.push(b);
    crossSectionPoints.push(points[x][crossSectionY]);
  }
  const waterLevel = canvHeight - canvHeight * normalizedHeight(config.waterLevel);

  for (let y = 0; y < canvHeight; y += 1) {
    for (let x = 0; x < maxX; x += 1) {
      const idx = (y * maxX + x) * 4;
      let color = y < waterLevel ? COLORS.nothing : COLORS.water;
      if (y >= heightData[x][0]) {
        const pointIdx = bs.closest(heightData[x], y);
        const p = crossSectionPoints[x][pointIdx];
        color = mode === 'type' ? COLORS[p.type] : plateColor(p.plate.id);
        if (y > bottom[x][pointIdx]) {
          // Mantle.
          color = [255, 35, 0];
        }
      }
      imageData.data[idx] = color[0];
      imageData.data[idx + 1] = color[1];
      imageData.data[idx + 2] = color[2];
      imageData.data[idx + 3] = 255;
    }
  }
}

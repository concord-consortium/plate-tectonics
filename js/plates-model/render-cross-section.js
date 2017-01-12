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

const HEIGHT = 150;

function normalizedHeight(val) {
  return (val - config.astenosphereBottom) / (config.maxHeight - config.astenosphereBottom);
}

// https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
function line(p0, p1) {
  let x0 = p0.x;
  let y0 = p0.y;
  const x1 = p1.x;
  const y1 = p1.y;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;
  const result = [];

  while (x0 !== x1 || y0 !== y1) {
    result.push({ x: x0, y: y0 });
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  result.push({ x: x0, y: y0 });
  return result;
}

export default function renderCrossSection(points, crossSectionPoint1, crossSectionPoint2, mode = 'type') {
  const coords = line(crossSectionPoint1, crossSectionPoint2);
  const lineLength = coords.length;
  const heightData = [];
  const bottom = [];
  const crossSectionPoints = [];
  for (let i = 0; i < lineLength; i += 1) {
    const x = coords[i].x;
    const y = coords[i].y;
    const h = (points[x][y] || []).map(point => HEIGHT - HEIGHT * normalizedHeight(point.height));
    heightData.push(h);
    const b = (points[x][y] || []).map(point => HEIGHT - HEIGHT * normalizedHeight(point.bottom));
    bottom.push(b);
    crossSectionPoints.push(points[x][y]);
  }
  const waterLevel = HEIGHT - HEIGHT * normalizedHeight(config.waterLevel);

  const imageData = new ImageData(lineLength, HEIGHT);

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < lineLength; x += 1) {
      const idx = (y * lineLength + x) * 4;
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
  return imageData;
}

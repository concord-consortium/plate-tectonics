import bs from 'binarysearch';
import { MIN_HEIGHT, MAX_HEIGHT } from './model';
import { OCEAN, CONTINENT } from './point';

const COLORS = {
  nothing: 220,
  [OCEAN]: 128,
  [CONTINENT]: 64,
};

export default function renderCrossSection(canvas, points, crossSectionY) {
  const maxX = points.length;
  if (maxX !== canvas.width) {
    throw new Error('Data has to have the same width as canvas');
  }
  const ctx = canvas.getContext('2d');
  const canvasHeight = canvas.height;
  const imageData = ctx.createImageData(canvas.width, canvas.height);

  const heightData = [];
  for (let x = 0; x < maxX; x += 1) {
    const h = (points[x][crossSectionY] || []).map(point =>
      canvasHeight - canvasHeight * (point.height - MIN_HEIGHT) / (MAX_HEIGHT - MIN_HEIGHT));
    heightData.push(h);
  }

  for (let x = 0; x < maxX; x += 1) {
    for (let y = 0; y < canvasHeight; y += 1) {
      const idx = (y * maxX + x) * 4;
      let color = COLORS.nothing;
      if (y >= heightData[x][0]) {
        const pointIdx = bs.closest(heightData[x], y);
        color = COLORS[points[x][y][pointIdx].type];
      }
      imageData.data[idx] = color;
      imageData.data[idx + 1] = color;
      imageData.data[idx + 2] = color;
      imageData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

import { MIN_HEIGHT, MAX_HEIGHT } from './model';

const DARK = 64;
const LIGHT = 200;

export default function renderCrossSection(canvas, data, crossSectionY) {
  const maxX = data.length;
  if (maxX !== canvas.width) {
    throw new Error('Data has to have the same width as canvas');
  }
  const ctx = canvas.getContext('2d');
  const canvasHeight = canvas.height;
  const imageData = ctx.createImageData(canvas.width, canvas.height);

  const heightData = [];
  for (let x = 0; x < maxX; x += 1) {
    const h = canvasHeight - canvasHeight * (data[x][crossSectionY] - MIN_HEIGHT) / (MAX_HEIGHT - MIN_HEIGHT);
    heightData.push(h);
  }

  for (let x = 0; x < maxX; x += 1) {
    for (let y = 0; y < canvasHeight; y += 1) {
      const idx = (y * maxX + x) * 4;
      const color = y >= heightData[x] ? DARK : LIGHT;
      imageData.data[idx] = color;
      imageData.data[idx + 1] = color;
      imageData.data[idx + 2] = color;
      imageData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

import colormap from 'colormap';
import { MIN_HEIGHT, MAX_HEIGHT } from './model';

const N_SHADES = 200;

const DEF_COLOR_MAP = colormap({
  colormap: 'jet',   // pick a builtin colormap or add your own
  nshades: N_SHADES, // how many divisions
  format: 'rgb',     // "hex" or "rgb" or "rgbaString"
  alpha: 1,
});
const NO_PLATE_COLOR = [220, 220, 220];

function heightToShade(val) {
  if (val == null) return -1;
  return Math.floor((val - MIN_HEIGHT) / (MAX_HEIGHT - MIN_HEIGHT) * (N_SHADES - 1));
}

export default function renderTopView(canvas, data, colorMap = DEF_COLOR_MAP) {
  const maxX = data.length;
  const maxY = data[0].length;
  if (maxX !== canvas.width || maxY !== canvas.height) {
    throw new Error('Data has to have the same dimensions as canvas');
  }
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(canvas.width, canvas.height);

  for (let x = 0; x < maxX; x += 1) {
    for (let y = 0; y < maxY; y += 1) {
      const shade = heightToShade(data[x][y]);
      const color = shade > 0 ? colorMap[shade] : NO_PLATE_COLOR;
      const dataIdx = (y * maxX + x) * 4;
      imageData.data[dataIdx] = color[0];
      imageData.data[dataIdx + 1] = color[1];
      imageData.data[dataIdx + 2] = color[2];
      imageData.data[dataIdx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

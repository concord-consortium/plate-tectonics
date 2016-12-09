import colormap from 'colormap';
import { MIN_HEIGHT, MAX_HEIGHT } from './model';

const N_SHADES = 70;

const DEF_COLOR_MAP = colormap({
  colormap: 'jet',   // pick a builtin colormap or add your own
  nshades: N_SHADES, // how many divisions
  format: 'rgb',     // "hex" or "rgb" or "rgbaString"
  alpha: 1,
});

function heightToShade(val) {
  if (val == null) return 0;
  return Math.floor((val - MIN_HEIGHT) / (MAX_HEIGHT - MIN_HEIGHT) * N_SHADES);
}

export default function renderTopView(canvas, data, colorMap = DEF_COLOR_MAP) {
  const n = data.length;
  const m = data[0].length;
  if (n !== canvas.height || m !== canvas.width) {
    throw new Error('Data has to have the same dimensions as canvas');
  }
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(canvas.width, canvas.height);

  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < m; j += 1) {
      const color = colorMap[heightToShade(data[i][j])];
      const dataIdx = (j * n + i) * 4;
      imageData.data[dataIdx] = color[0];
      imageData.data[dataIdx + 1] = color[1];
      imageData.data[dataIdx + 2] = color[2];
      imageData.data[dataIdx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

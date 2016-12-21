import colormap from 'colormap';
import config from './config';

const N_SHADES = 200;

const DEF_COLOR_MAP = colormap({
  colormap: 'jet',   // pick a builtin colormap or add your own
  nshades: N_SHADES, // how many divisions
  format: 'rgb',     // "hex" or "rgb" or "rgbaString"
  alpha: 1,
});
const NO_PLATE_COLOR = [220, 220, 220];
const BOUNDARY_COLOR = [16, 16, 16];

function heightToShade(val) {
  if (val == null) return -1;
  return Math.floor((val - config.minHeight) / (config.maxHeight - config.minHeight) * (N_SHADES - 1));
}

export default function renderTopView(canvas, points, mode = 'plates') {
  const maxX = points.length;
  const maxY = points[0].length;
  const boundary = function boundary(x, y) {
    if (x === 0 || y === 0) return false;
    const plate = points[x][y][0].plate;
    const p1 = points[x - 1] && points[x - 1][y] && points[x - 1][y][0];
    const p2 = points[x] && points[x][y - 1] && points[x][y - 1][0];
    const p3 = points[x - 1] && points[x - 1][y - 1] && points[x - 1][y - 1][0];
    // We consider given point boundary if neighbouring plate is different or there's no neighbouring plate at all.
    return !p1 || !p2 || !p3 ||
           p1.plate !== plate ||
           p2.plate !== plate ||
           p3.plate !== plate;
  };

  if (maxX !== canvas.width || maxY !== canvas.height) {
    throw new Error('Data has to have the same dimensions as canvas');
  }
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(canvas.width, canvas.height);

  for (let x = 0; x < maxX; x += 1) {
    for (let y = 0; y < maxY; y += 1) {
      let color = NO_PLATE_COLOR;
      if (points[x] && points[x][y]) {
        if (mode !== 'plates' && boundary(x, y)) {
          // Don't render plate boundaries in plates mode. Plate boundaries are visible anyway.
          color = BOUNDARY_COLOR;
        } else if (mode === 'height') {
          const shade = heightToShade(points[x][y][0].height);
          color = DEF_COLOR_MAP[shade];
        } else if (mode === 'plates') {
          color = config.plateColor[points[x][y][0].plate.id];
        }
      }
      const dataIdx = (y * maxX + x) * 4;
      imageData.data[dataIdx] = color[0];
      imageData.data[dataIdx + 1] = color[1];
      imageData.data[dataIdx + 2] = color[2];
      imageData.data[dataIdx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

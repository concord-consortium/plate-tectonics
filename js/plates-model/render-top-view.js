import { elevationColor, plateColor, BOUNDARY_COL, NO_PLATE_COL } from './colormaps';

export default function renderTopView(canvas, points, mode = 'plates', boundaries = false) {
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
      let color = NO_PLATE_COL;
      if (points[x] && points[x][y]) {
        if (boundaries && boundary(x, y)) {
          // Don't render plate boundaries in plates mode. Plate boundaries are visible anyway.
          color = BOUNDARY_COL;
        } else if (mode === 'height') {
          color = elevationColor(points[x][y][0].height);
        } else if (mode === 'plates') {
          color = plateColor(points[x][y][0].plate.id);
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

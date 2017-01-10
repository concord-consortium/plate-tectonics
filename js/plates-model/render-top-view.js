import config from './config';
import { elevationColor, plateColor, BOUNDARY_COL, NO_PLATE_COL } from './colormaps';
import { angleBetween } from '../utils';

const NEIGH_VEC = [{ x: -1, y: 0 }, { x: 0, y: -1 }];

function boundaryType(points, x, y) {
  if (x === 0 || y === 0) return false;
  const p1 = points[x][y][0];
  let result = false;
  for (let i = 0; i < NEIGH_VEC.length; i += 1) {
    if (!result || result === 'transform') {
      const vec = NEIGH_VEC[i];
      const p2 = points[x + vec.x] && points[x + vec.x][y + vec.y] && points[x + vec.x][y + vec.y][0];
      if (p2 && p2.plate !== p1.plate) {
        const relVel = { x: p1.vx - p2.vx, y: p1.vy - p2.vy };
        const relSpeed = Math.sqrt(relVel.x * relVel.x + relVel.y * relVel.y);
        if (relSpeed > config.platesMergeSpeedDiff) {
          const angle = angleBetween(vec, relVel);
          if (angle < Math.PI * 0.45) {
            result = 'convergent';
          } else if (angle > Math.PI * 0.55) {
            result = 'divergent';
          } else {
            result = 'transform';
          }
        } else {
          result = 'default';
        }
      }
    }
  }
  return result;
}

export default function renderTopView(imageData, points, mode = 'plates', boundaries = false) {
  const maxX = points.length;
  const maxY = points[0].length;

  if (maxX !== imageData.width || maxY !== imageData.height) {
    throw new Error('Data has to have the same dimensions as canvas');
  }

  for (let y = 0; y < maxY; y += 1) {
    for (let x = 0; x < maxX; x += 1) {
      let color = NO_PLATE_COL;
      if (points[x] && points[x][y]) {
        const boundary = boundaries && boundaryType(points, x, y);
        if (boundary) {
          // Don't render plate boundaries in plates mode. Plate boundaries are visible anyway.
          color = BOUNDARY_COL[boundary];
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
}

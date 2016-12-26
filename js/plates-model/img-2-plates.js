import config from './config';
import getImgData from '../get-img-data';
import Plate from './plate';
import Point from './point';

const BOUNDARY_H_VAL = 'b';
const PROCESSED_H_VAL = 'p';
// Process only 4 neighbours in DFS algorithm. If we processed all 8 (e.g. [-1, -1]),
// it would be easier to jump over plate boundary.
const NEIGHBOURS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// Boundary is defined by red pixels.
function isColorBoundary(data, i) {
  return data[i] > 32 && data[i + 1] === 0 && data[i + 2] === 0;
}

function normalize(data, i) {
  const min = config.subductionHeight;
  const max = config.maxHeight;
  const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
  const norm = (255 - avg) / 255;
  return norm * (max - min) + min;
}

// Transforms ImageData into height map. Boundarys are marked by null values.
function getHeightMap(imgData) {
  const width = imgData.width;
  const height = imgData.height;
  const data = imgData.data;
  const result = [];
  for (let i = 0, len = width * height; i < len; i += 1) {
    const x = i % width;
    const y = Math.floor(i / width);
    if (!result[x]) {
      result[x] = [];
    }
    result[x][y] = isColorBoundary(data, i * 4) ? BOUNDARY_H_VAL : normalize(data, i * 4);
  }
  return result;
}

function isBoundary(heightVal) {
  return heightVal === BOUNDARY_H_VAL;
}

function isProcessed(heightVal) {
  return heightVal === PROCESSED_H_VAL;
}

function getPlates(heightMap) {
  const width = heightMap.length;
  const height = heightMap[0].length;
  const plates = [];
  const queue = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pointHeight = heightMap[x][y];
      if (!isBoundary(pointHeight) && !isProcessed(pointHeight)) {
        const plate = new Plate({ x: 0, y: 0, vx: 0, vy: 0, maxX: width, maxY: height });
        plates.push(plate);
        const point = new Point({ x, y, height: pointHeight, plate, age: Infinity });
        plate.addPoint(point);
        queue.push(point);
        heightMap[x][y] = PROCESSED_H_VAL;
        while (queue.length > 0) {
          const p = queue.pop();
          const x0 = p.x;
          const y0 = p.y;
          NEIGHBOURS.forEach(([dx, dy]) => {
            const i = Math.max(0, Math.min(width - 1, x0 + dx));
            const j = Math.max(0, Math.min(height - 1, y0 + dy));
            const h = heightMap[i][j];
            if (!isProcessed(h)) {
              // If point is a boundary, use height of its neighbour.
              const nHeight = isBoundary(h) ? p.height : h;
              const neighbour = new Point({ x: i, y: j, height: nHeight, plate, age: Infinity });
              plate.addPoint(neighbour);
              if (!isBoundary(h)) {
                queue.push(neighbour);
              }
              // Mark point processed.
              heightMap[i][j] = PROCESSED_H_VAL;
            }
          });
        }
      }
    }
  }
  return plates;
}


export default function img2plates(imgSrc, callback) {
  getImgData(imgSrc, (imgData) => {
    const heightMap = getHeightMap(imgData);
    callback(getPlates(heightMap));
  });
}

import config from './config';
import getImgData from '../get-img-data';
import Plate from './plate';
import Point from './point';

const BORDER_COL = [255, 0, 0]; // red

function isBorder(data, i) {
  return data[i] === BORDER_COL[0] && data[i + 1] === BORDER_COL[1] && data[i + 2] === BORDER_COL[2];
}

function normalize(data, i) {
  const min = config.subductionHeight;
  const max = config.maxHeight;
  const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
  const norm = (255 - avg) / 255;
  return norm * (max - min) + min;
}

// Transforms ImageData into height map. Borders are marked by null values.
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
    result[x][y] = isBorder(data, i * 4) ? null : normalize(data, i * 4);
  }
  return result;
}

function getPlates(heightMap) {
  const width = heightMap.length;
  const height = heightMap[0].length;
  const plate = new Plate({ x: 0, y: 0, vx: 0, vy: 0, maxX: width, maxY: height });
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const point = new Point({ x, y, height: heightMap[x][y], plate, age: Infinity });
      plate.addPoint(point);
    }
  }
  return [plate];
}

export default function img2plates(imgSrc, callback) {
  getImgData(imgSrc, (imgData) => {
    const heightMap = getHeightMap(imgData);
    callback(getPlates(heightMap));
  });
}

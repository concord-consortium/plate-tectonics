import config from './config';
import Plate from './plate';
import Point, { OCEAN, CONTINENT } from './point';

function generatePlate({ width, height, type, x = 0, y = 0, vx = 0, vy = 0, maxX, maxY }) {
  let pointHeight;
  const plate = new Plate({ x, y, vx, vy, maxX, maxY });
  for (let px = x; px < x + width; px += 1) {
    for (let py = y; py < y + height; py += 1) {
      const pointType = typeof type === 'function' ? type(px, py) : type;
      if (pointType === OCEAN) {
        pointHeight = config.newOceanHeight;
      } else {
        pointHeight = Math.min(0.1, config.newOceanHeight + Math.pow(3 * ((px - x) / width), 0.5));
      }
      const point = new Point({ x: px, y: py, height: pointHeight, type: pointType, plate });
      plate.addPoint(point);
    }
  }
  return plate;
}

export function subduction(width, height) {
  const ocean = generatePlate({
    x: 0,
    y: 0,
    width: width * 0.5,
    height,
    type: OCEAN,
    vx: 2,
    vy: 0,
    maxX: width,
    maxY: height,
  });
  const continent = generatePlate({
    x: width * 0.5,
    y: 0,
    width: width * 0.5,
    height,
    type: CONTINENT,
    vx: 0,
    vy: 0,
    maxX: width,
    maxY: height,
  });
  return [ocean, continent];
}

export function continentalCollision(width, height) {
  const oceanAndCont = generatePlate({
    x: 0,
    y: 0,
    width: width * 0.5,
    height,
    type: function type(x, y) {
      return x > width * 0.1 && x < width * 0.3 && y > height * 0.3 && y < height * 0.7 ? CONTINENT : OCEAN;
    },
    vx: 2,
    vy: 0,
    maxX: width,
    maxY: height,
  });
  const continent = generatePlate({
    x: width * 0.5,
    y: 0,
    width: width * 0.5,
    height,
    type: CONTINENT,
    vx: 0,
    vy: 0,
    maxX: width,
    maxY: height,
  });
  return [oceanAndCont, continent];
}

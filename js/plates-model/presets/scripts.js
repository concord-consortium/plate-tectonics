import config from '../config';
import Plate from '../plate';
import Point, { OCEAN, CONTINENT } from '../point';

// A few simple scripts that generate initial plate configuration.

function generatePlate({ width, height, type, x = 0, y = 0, vx = 0, vy = 0, maxX, maxY, smoothCont = true }) {
  let pointHeight;
  const plate = new Plate({ x, y, vx, vy, maxX, maxY });
  for (let px = x; px < x + width; px += 1) {
    for (let py = y; py < y + height; py += 1) {
      const pointType = typeof type === 'function' ? type(px, py) : type;
      if (pointType === OCEAN) {
        pointHeight = config.subductionHeight;
      } else if (smoothCont) {
        pointHeight = Math.min(0.1, config.newOceanHeight + Math.pow(3 * ((px - x) / width), 0.5));
      } else {
        pointHeight = 0.1;
      }
      const point = new Point({ x: px, y: py, height: pointHeight, plate, age: Infinity });
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

export function subduction2(width, height) {
  const ocean = generatePlate({
    x: 0,
    y: 0,
    width: width * 0.5,
    height,
    type: OCEAN,
    vx: 3,
    vy: 0,
    maxX: width,
    maxY: height,
  });
  const continent1 = generatePlate({
    x: width * 0.5,
    y: 0,
    width: width * 0.1,
    height,
    type: CONTINENT,
    vx: 0,
    vy: 0,
    maxX: width,
    maxY: height,
  });
  const continent2 = generatePlate({
    x: width * 0.6,
    y: 0,
    width: width * 0.4,
    height,
    type: CONTINENT,
    vx: 1,
    vy: 0,
    maxX: width,
    maxY: height,
  });
  return [ocean, continent1, continent2];
}

export function continentalCollision(width, height) {
  const oceanAndCont = generatePlate({
    x: 0,
    y: 0,
    width: width * 0.5,
    height,
    type: function type(x, y) {
      return x > width * 0.05 && x < width * 0.45 && y > height * 0.05 && y < height * 0.95 ? CONTINENT : OCEAN;
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

export function islandCollision(width, height) {
  const oceanAndCont = generatePlate({
    x: 0,
    y: 0,
    width: width * 0.5,
    height,
    type: function type(x, y) {
      return x > width * 0.2 && x < width * 0.4 && y > height * 0.3 && y < height * 0.7 ? CONTINENT : OCEAN;
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

export function islandChainCollision(width, height) {
  const ocean1 = generatePlate({
    x: 0,
    y: 0,
    width: width * 0.5,
    height,
    type: function type(x, y) {
      return x > width * 0.05 && x < width * 0.15 &&
            (y > height * 0.2 && y < height * 0.4 ||
             y > height * 0.7 && y < height * 0.8) ? CONTINENT : OCEAN;
    },
    vx: 3,
    vy: 0,
    maxX: width,
    maxY: height,
  });
  const ocean2 = generatePlate({
    x: width * 0.5,
    y: 0,
    width: width * 0.5,
    height,
    type: OCEAN,
    vx: 0,
    vy: 0,
    maxX: width,
    maxY: height,
  });
  return [ocean1, ocean2];
}


export function midOceanRidge(width, height) {
  const cont1 = generatePlate({
    x: 0,
    y: 0,
    width: width * 0.2,
    height,
    type: CONTINENT,
    vx: 0,
    vy: 0,
    maxX: width,
    maxY: height,
    smoothCont: false,
  });
  const ocean1 = generatePlate({
    x: width * 0.2,
    y: 0,
    width: width * 0.3,
    height,
    type: OCEAN,
    vx: -2,
    vy: 0,
    maxX: width,
    maxY: height,
  });
  const ocean2 = generatePlate({
    x: width * 0.5,
    y: 0,
    width: width * 0.3,
    height,
    type: OCEAN,
    vx: 2,
    vy: 0,
    maxX: width,
    maxY: height,
  });
  const cont2 = generatePlate({
    x: width * 0.8,
    y: 0,
    width: width * 0.2,
    height,
    type: CONTINENT,
    vx: 0,
    vy: 0,
    maxX: width,
    maxY: height,
    smoothCont: false,
  });
  return [cont1, ocean1, ocean2, cont2];
}

import Surface from './surface';
import Point, { OCEAN, CONTINENT } from './point';
import Plate from './plate';
import HotSpot from './hot-spot';

export const MIN_HEIGHT = -1;
export const MAX_HEIGHT = 1;
const BASIC_OCEAN_HEIGHT = -0.5;
const BASIC_CONTINENT_HEIGHT = 0.01;

function generatePlate({ width, height, type, pointsHeight, x = 0, y = 0, vx = 0, vy = 0, maxX, maxY }) {
  const plate = new Plate({ x, y, vx, vy, maxX, maxY });
  for (let px = x; px < x + width; px += 1) {
    for (let py = y; py < y + height; py += 1) {
      const point = new Point({ x: px, y: py, height: pointsHeight, type, plate, maxX, maxY });
      plate.points.push(point);
    }
  }
  return plate;
}

export default class Model {
  constructor({ width = 512, height = 512, timeStep = 1 }) {
    this.width = width;
    this.height = height;
    this.timeStep = timeStep;
    this.surface = new Surface({ width, height });
    this.plates = [];
    this.testInit();
  }

  step() {
    this.movePlates();
    this.updateSurface();
    this.handleCollisions();
    this.activateHotSpots();
    this.updatePoints();
    this.updateHotSpots();
    this.removePointsBelowMinHeight();
    this.removeDeadHotSpots();
    this.removeEmptyPlates();
  }

  get maxHeight() {
    return this.surface.maxHeight;
  }

  get points() {
    return this.surface.points;
  }

  get hotSpots() {
    return [].concat([], ...this.plates.map(p => p.hotSpots));
  }

  movePlates() {
    this.plates.forEach((plate) => {
      plate.move(this.timeStep);
    });
  }

  updateSurface() {
    this.surface.reset();
    this.plates.forEach((plate) => {
      const points = plate.points;
      for (let i = 0, len = points.length; i < len; i += 1) {
        this.surface.setPoint(points[i]);
      }
    });
  }

  handleCollisions() {
    this.surface.forEachCollision((points) => {
      if (points.length === 2) {
        const p1 = points[0];
        const p2 = points[1];
        if (p1.type !== p2.type) {
          // Ocean - continent collision.
          const oceanPoint = p1.type === OCEAN ? p1 : p2;
          const continentPoint = p1.type === CONTINENT ? p1 : p2;
          oceanPoint.collideWithContinent(continentPoint, this.timeStep);

          if (Math.random() < oceanPoint.volcanicActProbability) {
            const continentPlate = continentPoint.plate;
            const newHotSpot = new HotSpot({
              x: continentPoint.x,
              y: continentPoint.y,
              radius: oceanPoint.volcanicActProbability * Math.random() * 500 + 5,
              plate: continentPlate,
            });
            continentPlate.addHotSpot(newHotSpot);
          }
        }
      }
    });
  }

  activateHotSpots() {
    this.plates.forEach((plate) => {
      plate.inactiveHotSpots.forEach((hotSpot) => {
        const points = this.surface.getSurfacePointsWithinRadius(hotSpot.x, hotSpot.y, hotSpot.radius);
        points.forEach(point => point.applyVolcanicActivity(hotSpot));
        hotSpot.active = true;
      });
    });
  }

  updatePoints() {
    this.plates.forEach((plate) => {
      plate.points.forEach((point) => {
        // E.g. handle ongoing collisions, subduction and so on.
        point.update();
      });
    });
  }

  updateHotSpots() {
    this.plates.forEach((plate) => {
      plate.hotSpots.forEach((hotSpot) => {
        hotSpot.update(this.timeStep);
      });
    });
  }

  removePointsBelowMinHeight() {
    this.plates.forEach((plate) => {
      plate.removePointsBelow(MIN_HEIGHT);
    });
  }

  removeDeadHotSpots() {
    this.plates.forEach((plate) => {
      plate.removeDeadHotSpots();
    });
  }

  removeEmptyPlates() {
    this.plates = this.plates.filter(p => p.notEmpty());
  }

  testInit() {
    const { width, height } = this;
    const ocean = generatePlate({
      x: 0,
      y: 0,
      width: width * 0.5,
      height,
      type: OCEAN,
      pointsHeight: BASIC_OCEAN_HEIGHT,
      vx: 2.5,
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
      pointsHeight: BASIC_CONTINENT_HEIGHT,
      vx: 0,
      vy: 0,
      maxX: width,
      maxY: height,
    });
    this.plates.push(ocean);
    this.plates.push(continent);
  }
}

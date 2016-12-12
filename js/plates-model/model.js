import Surface from './surface';
import Point, { OCEAN, CONTINENT } from './point';
import Plate from './plate';

export const MIN_HEIGHT = -1;
export const MAX_HEIGHT = 1;

function generatePlate({ width, height, type, pointsHeight, x = 0, y = 0, vx = 0, vy = 0, maxX, maxY }) {
  const plate = new Plate({ x, y, vx, vy });
  for (let px = 0; px < width; px += 1) {
    for (let py = 0; py < height; py += 1) {
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
    this.updateSurfaceHeight();
    this.handleCollisions();
    this.updatePoints();
    this.removePointsBelowMinHeight();
    this.removeEmptyPlates();
  }

  get maxHeight() {
    return this.surface.maxHeight;
  }

  get points() {
    return this.surface.points;
  }

  movePlates() {
    this.plates.forEach((plate) => {
      plate.move(this.timeStep);
    });
  }

  updateSurfaceHeight() {
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
          oceanPoint.collideWithContinent(continentPoint);
        }
      }
    });
  }

  updatePoints() {
    this.plates.forEach((plate) => {
      const plateDisplacement = plate.getDisplacement(this.timeStep);
      plate.points.forEach((point) => {
        // E.g. handle ongoing collisions, subduction and so on.
        point.update(plateDisplacement);
      });
    });
  }

  removePointsBelowMinHeight() {
    this.plates.forEach((plate) => {
      plate.removePointsBelow(MIN_HEIGHT);
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
      pointsHeight: -0.5,
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
      pointsHeight: 0.01,
      maxX: width,
      maxY: height,
    });
    this.plates.push(ocean);
    this.plates.push(continent);
  }
}

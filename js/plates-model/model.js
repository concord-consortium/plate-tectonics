import Surface from './surface';
import Point, { OCEAN, CONTINENT } from './point';
import Plate from './plate';
import HotSpot from './hot-spot';

export const MIN_HEIGHT = -1;
export const MAX_HEIGHT = 1;
export const BASIC_OCEAN_HEIGHT = -0.5;
export const WATER_LEVEL = 0;

function generatePlate({ width, height, type, x = 0, y = 0, vx = 0, vy = 0, maxX, maxY }) {
  let pointHeight;
  const plate = new Plate({ x, y, vx, vy, maxX, maxY });
  for (let px = x; px < x + width; px += 1) {
    for (let py = y; py < y + height; py += 1) {
      if (type === OCEAN) {
        pointHeight = BASIC_OCEAN_HEIGHT;
      } else {
        pointHeight = Math.min(0.1, BASIC_OCEAN_HEIGHT + Math.pow(3 * ((px - x) / width), 0.5));
      }
      const point = new Point({ x: px, y: py, height: pointHeight, type, plate });
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
    this.plates = [];
    this.prevSurface = null;
    this.surface = new Surface({ width, height, plates: this.plates });
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
    this.addNewPoints();
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
    this.prevSurface = this.surface;
    this.surface = new Surface({ width: this.width, height: this.height, plates: this.plates });
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

          if (Math.random() < oceanPoint.volcanicActProbability && !continentPoint.volcanicAct) {
            const continentPlate = continentPoint.plate;
            const newHotSpot = new HotSpot({
              x: continentPoint.x,
              y: continentPoint.y,
              radius: oceanPoint.volcanicActProbability * Math.random() * 400 + 5,
              strength: oceanPoint.getRelativeVelocity(continentPoint),
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
        let volcanicActAllowed = true;
        points.forEach((point) => {
          if (!point.volcanicActAllowed) {
            volcanicActAllowed = false;
          }
          point.applyVolcanicActivity(hotSpot);
        });
        hotSpot.active = true;
        // If at least one point within hot spot area doesn't allow hot spot activity, then disable it completely.
        // Don't remove hot spot immediately, so we don't try to create new hot spots immediately in the next step.
        // We could control that point by point, but it would cause more noisy look of the volcanoes / mountains.
        if (!volcanicActAllowed) {
          hotSpot.strength = 0;
        }
      });
    });
  }

  updatePoints() {
    this.plates.forEach((plate) => {
      plate.points.forEach((point) => {
        // E.g. handle ongoing collisions, subduction and so on.
        point.update(this.timeStep);
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

  // This handles divergent boundaries.
  addNewPoints() {
    const { width, height, surface, prevSurface } = this;
    for (let x = 0; x < width; x += 1) {
      for (let y = 0; y < height; y += 1) {
        // If there's some point missing, create a new ocean crust and add it to the plate that
        // was in the same location before.
        if (!surface.points[x][y]) {
          const plate = prevSurface.points[x][y] && prevSurface.points[x][y][0].plate;
          if (plate) {
            const newPoint = new Point({ x, y, type: OCEAN, height: BASIC_OCEAN_HEIGHT, plate });
            plate.points.push(newPoint);
            // Update surface object too, so prevSurface in the next step is valid!
            surface.points[x][y] = [newPoint];
          }
        }
      }
    }
  }

  testInit() {
    const { width, height } = this;
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
    this.plates.push(ocean);
    this.plates.push(continent);
  }
}

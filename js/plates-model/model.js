import Surface from './surface';
import config from './config';
import Point, { OCEAN, CONTINENT } from './point';
import HotSpot from './hot-spot';
import { calcContinents } from './continent';
import * as initializers from './initializers';

export default class Model {
  constructor({ width = 512, height = 512, timeStep = 1, preset = 'continentalCollision' }) {
    this.width = width;
    this.height = height;
    this.timeStep = timeStep;
    this.plates = initializers[preset](width, height);
    this.prevSurface = null;
    this.surface = new Surface({ width, height, plates: this.plates });
  }

  step() {
    this.movePlates();
    this.updateSurface();
    this.updateContinents();
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

  updateContinents() {
    // this.surface.forEachPoint((p) => { p.continent = null; });
    calcContinents(this.surface);
  }

  handleCollisions() {
    this.surface.forEachCollision((points) => {
      if (points.length === 2) {
        const p1 = points[0];
        const p2 = points[1];
        if (p1.plate === p2.plate) {
          // Probably merged continents. Don't need lower point anymore (note that points are sorted by height).
          p2.alive = false;
        } else if (p1.type !== p2.type) {
          this.oceanContinentCollision(p1, p2);
        } else if (p1.type === CONTINENT && p2.type === CONTINENT) {
          this.continentContinentCollision(p1, p2);
        } else if (p1.type === OCEAN && p2.type === OCEAN) {
          this.oceanOceanCollision(p1, p2);
        }
      }
    });
  }

  oceanContinentCollision(p1, p2) {
    // Ocean - continent collision.
    const oceanPoint = p1.type === OCEAN ? p1 : p2;
    const continentPoint = p1.type === CONTINENT ? p1 : p2;
    oceanPoint.setupSubduction(continentPoint);
    if (Math.random() < oceanPoint.volcanicActProbability && !continentPoint.volcanicAct) {
      const continentPlate = continentPoint.plate;
      const newHotSpot = new HotSpot({
        x: continentPoint.x,
        y: continentPoint.y,
        radius: oceanPoint.volcanicActProbability * Math.random() * 100 + 5,
        strength: oceanPoint.getRelativeVelocity(continentPoint),
        plate: continentPlate,
      });
      continentPlate.addHotSpot(newHotSpot);
    }
  }

  continentContinentCollision(p1, p2) {
    // Make sure that colliding continents have their own plates. We don't want to modify speed of the ocean
    // only because continents are colliding.
    if (!p1.plate.continentOnly) {
      const newPlate = p1.plate.extractContinent(p1.continent.points);
      this.plates.push(newPlate);
    }
    if (!p2.plate.continentOnly) {
      const newPlate = p2.plate.extractContinent(p2.continent.points);
      this.plates.push(newPlate);
    }
    const p1p2Vx = p1.plate.vx - p2.plate.vx;
    const p1p2Vy = p1.plate.vy - p2.plate.vy;
    const relVelocity = Math.sqrt(p1p2Vx * p1p2Vx + p1p2Vy * p1p2Vy);
    if (relVelocity > 0.1) {
      const c1c2SizeRatio = p1.continent.size / p2.continent.size;

      p1.plate.vx -= config.continentCollisionFriction * p1p2Vx / c1c2SizeRatio;
      p1.plate.vy -= config.continentCollisionFriction * p1p2Vy / c1c2SizeRatio;
      p2.plate.vx += config.continentCollisionFriction * p1p2Vx * c1c2SizeRatio;
      p2.plate.vy += config.continentCollisionFriction * p1p2Vy * c1c2SizeRatio;
      const hotSpotConfig = {
        x: p1.x,
        y: p1.y,
        radius: Math.random() * 12 + 4,
        strength: relVelocity * 7,
      };
      const newHotSpot1 = new HotSpot(Object.assign({}, hotSpotConfig, { plate: p1.plate }));
      p1.plate.addHotSpot(newHotSpot1);
      // Should we add hot spot to the other plate too?
    } else if (p1.plate !== p2.plate) {
      // Merge plates.
      const vx = 0.5 * (p1.plate.vx + p2.plate.vx);
      const vy = 0.5 * (p1.plate.vy + p2.plate.vy);
      p1.plate.merge(p2.plate);
      p1.plate.vx = vx;
      p1.plate.vy = vy;
      // Merge continents.
      p1.plate.points.forEach((p) => {
        p.continent = p1.continent;
      });
    }
  }

  oceanOceanCollision(p1, p2) {
    p2.setupSubduction(p1);
    if (Math.random() < p2.volcanicActProbability && !p1.volcanicAct) {
      const plate = p1.plate;
      const newHotSpot = new HotSpot({
        x: p1.x,
        y: p1.y,
        radius: p2.volcanicActProbability * Math.random() * 100 + 5,
        strength: p2.getRelativeVelocity(p1),
        plate,
      });
      plate.addHotSpot(newHotSpot);
    }
  }

  activateHotSpots() {
    this.plates.forEach((plate) => {
      plate.inactiveHotSpots.forEach((hotSpot) => {
        let volcanicActAllowed = true;
        this.surface.forEachPlatePointWithinRadius(plate, hotSpot.x, hotSpot.y, hotSpot.radius, (point) => {
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
      plate.removeDeadPoints();
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
        if (!surface.points[x][y] || surface.points[x][y][0].subduction) {
          const plate = prevSurface.points[x][y] && prevSurface.points[x][y][0].plate;
          if (plate) {
            const newPoint = new Point({ x, y, type: OCEAN, height: config.newOceanHeight, plate });
            plate.addPoint(newPoint);
            // Update surface object too, so prevSurface in the next step is valid!
            surface.setPoint(newPoint);
          }
        }
      }
    }
  }
}

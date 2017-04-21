import Surface from './surface';
import config from './config';
import Point from './point';
import HotSpot from './hot-spot';
import { calcContinents } from './continent';
import { mod } from '../utils';

function getSubductingPoint(p1, p2) {
  return p1.plate.subductionIdx < p2.plate.subductionIdx ? p1 : p2;
}

export default class Model {
  constructor({ width = 512, height = 512, timeStep = 1, plates = [] }) {
    this.width = width;
    this.height = height;
    this.timeStep = timeStep;
    this.plates = plates;
    this.prevSurface = null;
    this.surface = new Surface({ width, height, plates });
    this.stepIdx = 0;

    global.model = this;
  }

  step() {
    this.stepIdx += 1;
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
    this.sortSurface();
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

  get size() {
    return this.width * this.height;
  }

  getPointAt(x, y) {
    return this.surface.getSurfacePoint(x, y);
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
    this.surface.forEachPoint((p) => { p.continent = null; });
    calcContinents(this.surface);
  }

  handleCollisions() {
    this.surface.forEachCollision((points) => {
      const p1 = points[0];
      const p2 = points[1];
      if (p1.plate === p2.plate) {
        // Probably merged continents. Don't need lower point anymore (note that points are sorted by height).
        p2.alive = false;
      } else if (p1.type !== p2.type) {
        this.oceanContinentCollision(p1, p2);
      } else if (p1.isContinent && p2.isContinent) {
        this.continentContinentCollision(p1, p2);
      } else if (p1.isOcean && p2.isOcean) {
        this.oceanOceanCollision(p1, p2);
      }
    });
  }

  oceanContinentCollision(p1, p2) {
    // Ocean - continent collision.
    const oceanPoint = p1.isOcean ? p1 : p2;
    const continentPoint = p1.isContinent ? p1 : p2;
    if (getSubductingPoint(p1, p2) === oceanPoint) {
      // Ocean goes under continent, expected case. Setup subduction.
      this.oceanContinentSubduction(oceanPoint, continentPoint);
    } else {
      // Continent should go under ocean, what is impossible.
      // Instead simulate a collision between continent and ocean - plates will slow down and eventually merge.
      this.continentCrustCollision(p1, p2, false);
    }
  }

  oceanContinentSubduction(oceanPoint, continentPoint) {
    oceanPoint.setupSubduction(continentPoint);
    if (Math.random() < oceanPoint.volcanicActProbability && !continentPoint.hotSpotAct) {
      const continentPlate = continentPoint.plate;
      const newHotSpot = new HotSpot({
        x: continentPoint.x,
        y: continentPoint.y,
        radius: oceanPoint.volcanicActProbability * Math.random() * 20 + 5,
        strength: config.volcanicActStrength,
        plate: continentPlate,
      });
      continentPlate.addHotSpot(newHotSpot);
    }
  }

  continentContinentCollision(p1, p2) {
    this.continentCrustCollision(p1, p2, true);
  }

  continentCrustCollision(p1, p2, orogeny) {
    const pl1 = p1.plate;
    const pl2 = p2.plate;
    // Make sure that colliding islands have their own plates. We don't want to modify speed of the ocean
    // only because small islands are colliding.
    if (p1.isIsland && !p1.continentOnly) {
      const newPlate = pl1.extractContinent(p1.continent.points);
      pl2.merge(newPlate);
      return;
    }
    if (p2.isIsland && !p2.continentOnly) {
      const newPlate = pl2.extractContinent(p2.continent.points);
      pl1.merge(newPlate);
      return;
    }
    const k = config.continentCollisionFriction;
    const pl1Size = p1.continent && p1.continent.size || pl1.size;
    const pl2Size = p2.continent && p2.continent.size || pl2.size;
    pl1.vx = Math.max(0, pl1.vx - k / pl1Size);
    pl1.vy = Math.max(0, pl1.vy - k / pl1Size);
    pl2.vx = Math.max(0, pl2.vx - k / pl2Size);
    pl2.vy = Math.max(0, pl2.vy - k / pl2Size);
    const diff = Math.sqrt(Math.pow(pl1.vx - pl2.vx, 2) + Math.pow(pl1.vy - pl2.vy, 2));
    if (diff > config.platesMergeSpeedDiff) {
      if (orogeny) {
        const newHotSpot1 = new HotSpot({
          x: p1.x + Math.random() * 30 - 15,
          y: p1.y + Math.random() * 30 - 15,
          radius: Math.random() * 12 + 2,
          strength: config.orogenyStrength,
          lifeRatio: 0.1,
          plate: pl1,
        });
        pl1.addHotSpot(newHotSpot1);
        const newHotSpot2 = new HotSpot({
          x: p1.x + Math.random() * 30 - 15,
          y: p1.y + Math.random() * 30 - 15,
          radius: Math.random() * 12 + 2,
          strength: config.orogenyStrength,
          lifeRatio: 0.1,
          plate: pl2,
        });
        pl2.addHotSpot(newHotSpot2);
      }
      // Remove lower point.
      p2.alive = false;
    } else {
      const biggerPlate = pl1.size >= pl2.size ? p1 : p2;
      const smallerPlate = pl1.size < pl2.size ? p1 : p2;
      // Merge only smaller plates. Two big continents will be still divided, but their velocity be the same.
      if (smallerPlate.isIsland) {
        biggerPlate.plate.merge(smallerPlate.plate);
      }
      pl1.vx = pl2.vx = pl2.vx = pl2.vy = 0;
    }
  }

  oceanOceanCollision(p1, p2) {
    const subductingPoint = getSubductingPoint(p1, p2);
    const surfacePoint = subductingPoint === p1 ? p2 : p1;
    // if (surfacePoint.isSubducting) {
    //   // If surface point is already subducting, ignore this type of collision. It could create weird effects
    //   // when non-height based subduction is enabled.
    //   return;
    // }
    subductingPoint.setupSubduction(surfacePoint);
    if (Math.random() < subductingPoint.volcanicActProbability && !surfacePoint.hotSpotAct) {
      const plate = surfacePoint.plate;
      const newHotSpot = new HotSpot({
        x: surfacePoint.x,
        y: surfacePoint.y,
        radius: subductingPoint.volcanicActProbability * Math.random() * 50 + 10,
        strength: config.volcanicActStrength * subductingPoint.relativeSpeed(surfacePoint) * 3 * Math.random(),
        plate,
      });
      plate.addHotSpot(newHotSpot);
    }
  }

  activateHotSpots() {
    this.plates.forEach((plate) => {
      plate.inactiveHotSpots.forEach((hotSpot) => {
        let hotSpotAllowed = true;
        this.surface.forEachPlatePointWithinRadius(plate, hotSpot.x, hotSpot.y, hotSpot.radius, (point) => {
          // point === null means that boundary between plates has been found. Do not let hot spots overlapping
          // plate boundaries (it doesn't look good).
          if (point === null || !point.hotSpotAllowed) {
            hotSpotAllowed = false;
          }
          if (point) point.applyHotSpot(hotSpot);
        });
        hotSpot.active = true;
        // If at least one point within hot spot area doesn't allow hot spot activity, then disable it completely.
        // Don't remove hot spot immediately, so we don't try to create new hot spots immediately in the next step.
        // We could control that point by point, but it would cause more noisy look of the volcanoes / mountains.
        if (!hotSpotAllowed) {
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

  // This is necessary, as points' heights have been updated.
  sortSurface() {
    this.surface.sort();
  }

  // This handles divergent boundaries.
  addNewPoints() {
    const { width, height, surface, prevSurface } = this;
    for (let x = 0; x < width; x += 1) {
      for (let y = 0; y < height; y += 1) {
        // If there's some point missing, create a new ocean crust and add it to the plate that
        // was in the same location before.
        if (!surface.points[x][y] || surface.points[x][y][0].isSubducting) {
          const prevPoint = prevSurface.points[x][y] && prevSurface.points[x][y][0];
          if (prevPoint) {
            const plate = prevPoint.plate;
            // Don't set config.newOceanHeight immediately, so the ridge builds up its height slowly.
            const newHeight = Math.min(prevPoint.height + 0.03, config.newOceanHeight);
            const newPoint = new Point({ x, y, height: newHeight, plate, cooling: true });
            plate.addPoint(newPoint);
            // Update surface object too, so prevSurface in the next step is valid!
            surface.setPoint(newPoint);
          }
        }
      }
    }
  }
}

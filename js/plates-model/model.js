import Surface from './surface';
import config from './config';
import Point, { OCEAN, CONTINENT } from './point';
import HotSpot from './hot-spot';
import { calcContinents } from './continent';

function isIsland(point) {
  // Assume that land is an island if its size is smaller than X% of the whole plate area
  // (defined by islandRatio value).
  return point.continent.size < point.plate.size * config.islandRatio;
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
      } else if (p1.type === CONTINENT && p2.type === CONTINENT) {
        this.continentContinentCollision(p1, p2);
      } else if (p1.type === OCEAN && p2.type === OCEAN) {
        this.oceanOceanCollision(p1, p2);
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
        radius: oceanPoint.volcanicActProbability * Math.random() * 20 + 5,
        strength: config.volcanicActStrength * oceanPoint.relativeSpeed(continentPoint),
        plate: continentPlate,
      });
      continentPlate.addHotSpot(newHotSpot);
    }
  }

  continentContinentCollision(p1, p2) {
    // Make sure that colliding islands have their own plates. We don't want to modify speed of the ocean
    // only because small islands are colliding.
    if (isIsland(p1) && !p1.plate.continentOnly) {
      const newPlate = p1.plate.extractContinent(p1.continent.points);
      this.plates.push(newPlate);
    }
    if (isIsland(p2) && !p2.plate.continentOnly) {
      const newPlate = p2.plate.extractContinent(p2.continent.points);
      this.plates.push(newPlate);
    }
    const pl1 = p1.plate;
    const pl2 = p2.plate;
    const finalVx = (pl1.size * pl1.vx + pl2.size * pl2.vx) / (pl1.size + pl2.size);
    const finalVy = (pl1.size * pl1.vy + pl2.size * pl2.vy) / (pl1.size + pl2.size);
    const pl1VxDiff = pl1.vx - finalVx;
    const pl1VyDiff = pl1.vy - finalVy;
    const pl2VxDiff = pl2.vx - finalVx;
    const pl2VyDiff = pl2.vy - finalVy;
    const pl1Diff = Math.sqrt(pl1VxDiff * pl1VxDiff + pl1VyDiff * pl1VyDiff);
    const pl2Diff = Math.sqrt(pl2VxDiff * pl2VxDiff + pl2VyDiff * pl2VyDiff);
    // Make friction proportional to the continent size. It ensures that continents would pretty much overlap in the
    // same amount, no matter what's the size of the surrounding plate.
    const smallerContinentSize = Math.min(p1.continent.size, p2.continent.size);
    const k = Math.min(0.9, config.continentCollisionFriction / smallerContinentSize);
    pl1.vx -= k * pl1VxDiff;
    pl1.vy -= k * pl1VyDiff;
    pl2.vx -= k * pl2VxDiff;
    pl2.vy -= k * pl2VyDiff;
    if (Math.max(pl1Diff, pl2Diff) > config.platesMergeSpeedDiff) {
      const newHotSpot1 = new HotSpot({
        x: p1.x + Math.random() * 30 - 15,
        y: p1.y + Math.random() * 30 - 15,
        radius: Math.random() * 12 + 2,
        strength: 30,
        lifeRatio: 0.1,
        plate: pl1,
        overlapping: true,
      });
      pl1.addHotSpot(newHotSpot1);
      const newHotSpot2 = new HotSpot({
        x: p1.x + Math.random() * 30 - 15,
        y: p1.y + Math.random() * 30 - 15,
        radius: Math.random() * 12 + 2,
        strength: 30,
        lifeRatio: 0.1,
        plate: pl2,
        overlapping: true,
      });
      pl2.addHotSpot(newHotSpot2);
      // Remove lower point.
      p2.alive = false;
    } else {
      const biggerPlate = pl1.size >= pl2.size ? pl1 : pl2;
      const smallerPlate = pl1.size < pl2.size ? pl1 : pl2;
      // Merge only smaller plates. Two big continents will be still divided, but their velocity be the same.
      if (smallerPlate.size < this.size * config.mergePlateRatio) {
        biggerPlate.merge(smallerPlate);
      }
      smallerPlate.vx = finalVx;
      smallerPlate.vy = finalVy;
      biggerPlate.vx = finalVx;
      biggerPlate.vy = finalVy;
      // Make sure that plates have the same fractional part of the coordinates, e.g. both have X = 1.35, but not
      // 1.35 and 1.78. It matters, as everything is casted on the grid where coordinates are integers. If fractional
      // part of plate coords is different, plates can move to next cells at different time and some visual artifacts
      // might be visible.
      const xFracDiff = 0.5 * (Math.abs(smallerPlate.x % 1) - Math.abs(biggerPlate.x % 1));
      const yFracDiff = 0.5 * (Math.abs(smallerPlate.y % 1) - Math.abs(biggerPlate.y % 1));
      smallerPlate.x -= Math.sign(smallerPlate.x) * xFracDiff;
      biggerPlate.x += Math.sign(biggerPlate.x) * xFracDiff;
      smallerPlate.y -= Math.sign(smallerPlate.y) * yFracDiff;
      biggerPlate.y += Math.sign(biggerPlate.y) * yFracDiff;
    }
  }

  oceanOceanCollision(p1, p2) {
    // There are two methods to decide which points is going to subduct.
    // If config.heightBasedSubduction === true, it will be always the higher point.
    // Otherwise, every point from one plate will subduct, no matter what is the current height.
    // It ensures consistent subduction across the whole boundary.
    const subductingPlatePoint = p1.plate.id < p2.plate.id ? p1 : p2;
    // Note that points are sorted and p1.height > p2.height.
    const subductingPoint = config.heightBasedSubduction ? p2 : subductingPlatePoint;
    const surfacePoint = subductingPoint === p1 ? p2 : p1;
    if (surfacePoint.subduction) {
      // If surface point is already subducting, ignore this type of collision. It could create weird effects
      // when non-height based subduction is enabled.
      return;
    }
    subductingPoint.setupSubduction(surfacePoint);
    if (Math.random() < subductingPoint.volcanicActProbability && !surfacePoint.volcanicAct) {
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
        let volcanicActAllowed = true;
        this.surface.forEachPlatePointWithinRadius(plate, hotSpot.x, hotSpot.y, hotSpot.radius, (point) => {
          // point === null means that boundary between plates has been found. Do not let hot spots overlapping
          // plate boundaries (it doesn't look good).
          if (point === null || !point.volcanicActAllowed) {
            volcanicActAllowed = false;
          }
          if (point) point.applyVolcanicActivity(hotSpot);
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

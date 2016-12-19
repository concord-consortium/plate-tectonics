import config from './config';

export const OCEAN = 0;
export const CONTINENT = 1;

// Subduction should be proportional to velocity and time step - it ensures that the plate will disappear in the same
// pace and curve would look the same for every velocity and time step. subductionDist makes curve look like quadratic
// function rather than linear.
function subductionHeightChange(subductionVelocity, timeStep, subductionDist) {
  return config.subductionRatio * subductionVelocity * timeStep * subductionDist;
}

export default class Point {
  constructor({ x, y, type, height, plate }) {
    // Make sure that relative coords are always positive and rounded to make other calculations easier.
    this.relX = Math.round(x >= plate.x ? x - plate.x : x - plate.x + plate.maxX);
    this.relY = Math.round(y >= plate.y ? y - plate.y : y - plate.y + plate.maxY);
    this.type = type;
    this.height = height;
    this.plate = plate;
    this.age = 0;
    // Subduction properties:
    this.subductionDist = null;
    this.subductionVelocity = null;
    // Volcanic activity properties:
    this.volcanicHotSpot = false;
    this.distFromVolcanoCenter = null;
    this.volcanicActTime = 0;
  }

  get x() {
    return Math.round(this.relX + this.plate.x) % this.plate.maxX;
  }

  get y() {
    return Math.round(this.relY + this.plate.y) % this.plate.maxY;
  }

  get vx() {
    return this.plate.vx;
  }

  get vy() {
    return this.plate.vy;
  }

  get subduction() {
    return this.subductionDist !== null;
  }

  get volcanicAct() {
    return this.volcanicHotSpot !== null;
  }

  get volcanicActAllowed() {
    return this.volcanicActTime < config.volcanicActMaxTime;
  }

  get volcanicActProbability() {
    if (!this.subduction) return 0;
    const normalizedDist = (this.subductionDist - config.volcanicActMinDist) /
                           (config.volcanicActMaxDist - config.volcanicActMinDist);
    return Math.pow(Math.min(1 - normalizedDist, normalizedDist) / 0.5, 7);
  }

  getRelativeVelocity(otherPoint) {
    const vxDiff = this.vx - otherPoint.vx;
    const vyDiff = this.vy - otherPoint.vy;
    return Math.sqrt(vxDiff * vxDiff + vyDiff * vyDiff);
  }

  collideWithContinent(otherPoint) {
    if (!this.subduction) {
      this.subductionDist = 0;
    }
    this.subductionVelocity = this.getRelativeVelocity(otherPoint);
  }

  applyVolcanicActivity(hotSpot) {
    this.volcanicHotSpot = hotSpot;
    // Cache distance so we don't need to recalculate it in each simulation step.
    this.distFromVolcanoCenter = hotSpot.dist(this);
  }

  update(timeStep) {
    if (this.type === OCEAN && this.age < config.oceanicCrustCoolingTime) {
      // Oceanic crust cools down and becomes denser.
      this.height -= config.oceanicCrustCoolingRatio * timeStep;
    }

    if (this.subduction) {
      this.subductionDist += this.subductionVelocity * timeStep;
      this.height -= subductionHeightChange(this.subductionVelocity, timeStep, this.subductionDist);
    }

    if (this.volcanicHotSpot && this.volcanicHotSpot.alive) {
      this.height += this.volcanicHotSpot.heightChange(this.distFromVolcanoCenter) * timeStep;
      this.volcanicActTime += timeStep;
    } else {
      this.volcanicHotSpot = null;
      this.distFromVolcanoCenter = null;
    }

    if (this.height > 1) {
      this.height = 1;
    }

    this.age += timeStep;
  }
}

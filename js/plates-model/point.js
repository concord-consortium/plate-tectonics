import config from './config';
import PlatePoint from './plate-point';

export const OCEAN = 0;
export const CONTINENT = 1;

// Subduction should be proportional to velocity and time step - it ensures that the plate will disappear in the same
// pace and curve would look the same for every velocity and time step. subductionDist makes curve look like quadratic
// function rather than linear.
function subductionHeightChange(subductionVelocity, timeStep, subductionDist) {
  return config.subductionRatio * subductionVelocity * timeStep * subductionDist;
}

export default class Point extends PlatePoint {
  constructor({ x, y, plate, height, age = 0 }) {
    super({ x, y, plate });
    this.type = height > config.newOceanHeight ? CONTINENT : OCEAN;
    this.height = height;
    this.age = age;
    // Needs to be calculated later.
    this.continent = null;
    this.alive = true;
    // Subduction properties:
    this.subductionDist = null;
    this.subductionVelocity = 0;
    // Volcanic activity properties:
    this.volcanicHotSpot = false;
    this.distFromVolcanoCenter = null;
    this.volcanicActTime = 0;
  }

  get isOcean() {
    return this.type === OCEAN;
  }

  get isContinent() {
    return this.type === CONTINENT;
  }

  get subduction() {
    return this.subductionDist !== null;
  }

  get hasSubducted() {
    return this.height <= config.minHeight;
  }

  get volcanicAct() {
    return this.volcanicHotSpot !== null;
  }

  get volcanicActAllowed() {
    return this.volcanicActTime < config.hotSpotActMaxTime && !this.subduction;
  }

  get volcanicActProbability() {
    if (!this.subduction) return 0;
    const normalizedDist = (this.subductionDist - config.volcanicActMinDist) /
                           (config.volcanicActMaxDist - config.volcanicActMinDist);
    return Math.pow(Math.min(1 - normalizedDist, normalizedDist) / 0.5, 7);
  }

  setupSubduction(otherPoint) {
    if (!this.subduction) {
      this.subductionDist = 0;
    }
    this.height = Math.min(config.subductionHeight, this.height);
    this.subductionVelocity = Math.max(this.relativeSpeed(otherPoint), 0.5);
  }

  applyVolcanicActivity(hotSpot) {
    this.volcanicHotSpot = hotSpot;
    // Cache distance so we don't need to recalculate it in each simulation step.
    this.distFromVolcanoCenter = hotSpot.dist(this);
  }

  update(timeStep) {
    if (this.type === OCEAN && this.age < config.oceanicCrustCoolingTime) {
      // Oceanic crust cools down and becomes denser.
      this.height -= config.oceanicCrustCoolingRatio * timeStep * this.speed;
      this.height = Math.max(this.height, config.subductionHeight);
      this.age += timeStep * this.speed;
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

    if (this.type === OCEAN && this.height > 0) {
      this.type = CONTINENT;
    }

    if (this.height > config.maxHeight) {
      this.height = config.maxHeight;
    }

    if (this.hasSubducted || this.outOfBounds) {
      this.alive = false;
    }
  }
}

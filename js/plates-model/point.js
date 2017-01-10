import config from './config';
import PlatePoint from './plate-point';

export const OCEAN = 0;
export const CONTINENT = 1;

const MIN_OCEAN_THICKNESS = 0.1;
const SUBDUCTING_PLATE_THICKNESS = config.subductionHeight - config.minHeight;
const OCEAN_THICKNESS_GROWTH = 0.005;

let oceanFloorTexture = 0.05;
function oceanFloorHeight() {
  // Add some random factor to the ocean floor height so there's visible texture and users can see that oceans
  // are moving.
  if (Math.random() < 0.00002) {
    oceanFloorTexture *= -1;
  }
  return config.subductionHeight + oceanFloorTexture;
}

// Subduction should be proportional to velocity and time step - it ensures that the plate will disappear in the same
// pace and curve would look the same for every velocity and time step. subductionDist makes curve look like quadratic
// function rather than linear.
function subductionHeightChange(subductionVelocity, timeStep, subductionDist) {
  return config.subductionRatio * subductionVelocity * timeStep * subductionDist;
}

export default class Point extends PlatePoint {
  constructor({ x, y, plate, height, age = 0, cooling = false }) {
    super({ x, y, plate });
    this.height = height;
    this.age = age;
    this.cooling = cooling;
    // Needs to be calculated later.
    this.continent = null;
    this.alive = true;
    // Subduction properties:
    this.subductionDist = null;
    this.subductionVelocity = 0;
    // Volcanic activity and orogeny properties:
    this.currentHotSpot = false;
    this.distFromHotSpotCenter = null;
    // Counts how much time given point has been under influence of hot spots. At some point doesn't accept
    // any more activity, so we don't create infinitely high mountains.
    this.hotSpotActTime = 0;
  }

  get isContinent() {
    return this.height > config.newOceanHeight;
  }

  get isOcean() {
    return !this.isContinent;
  }

  get type() {
    return this.isContinent ? CONTINENT : OCEAN;
  }

  get isSubducting() {
    return this.subductionDist !== null;
  }

  get hasMelted() {
    return this.height <= config.meltingHeight;
  }

  get thickness() {
    if (this.isContinent) {
      // Continents should just reach minHeight.
      return this.height - config.minHeight;
    }
    // Ocean. When plate is subducting use constant thickness. If not, make sure it's going to the minHeight
    // or is a bit thinner when ocean is still young.
    const maxThickness = this.isSubducting ? SUBDUCTING_PLATE_THICKNESS : (this.height - config.minHeight);
    return Math.min(maxThickness, this.age * OCEAN_THICKNESS_GROWTH + MIN_OCEAN_THICKNESS);
  }

  // Elevation / height of the bottom surface.
  get bottom() {
    return this.height - this.thickness;
  }

  get hotSpotAct() {
    return this.currentHotSpot !== null;
  }

  get hotSpotAllowed() {
    return this.hotSpotActTime < config.hotSpotActMaxTime && !this.isSubducting;
  }

  get volcanicActProbability() {
    if (!this.isSubducting) return 0;
    const normalizedDist = (this.subductionDist - config.volcanicActMinDist) /
                           (config.volcanicActMaxDist - config.volcanicActMinDist);
    return Math.pow(Math.min(1 - normalizedDist, normalizedDist) / 0.5, 7);
  }

  setupSubduction(otherPoint) {
    if (!this.isSubducting) {
      this.subductionDist = 0;
    }
    this.height = Math.min(config.subductionHeight, this.height);
    this.subductionVelocity = Math.max(this.relativeSpeed(otherPoint), 0.5);
  }

  applyHotSpot(hotSpot) {
    this.currentHotSpot = hotSpot;
    // Cache distance so we don't need to recalculate it in each simulation step. Hot spots are always affecting
    // only one plate, so distance within point and plate can't change.
    this.distFromHotSpotCenter = hotSpot.dist(this);
  }

  update(timeStep) {
    if (this.isOcean && this.cooling) {
      if (this.height > oceanFloorHeight()) {
        // Oceanic crust cools down and becomes denser.
        this.height -= (config.oceanicCrustCoolingRatio * timeStep * this.speed) / Math.max(Math.pow(this.age, 0.5), 2);
      } else {
        this.cooling = false;
      }
    }

    this.age += timeStep * this.speed;

    if (this.isSubducting) {
      this.subductionDist += this.subductionVelocity * timeStep;
      this.height -= subductionHeightChange(this.subductionVelocity, timeStep, this.subductionDist);
    }

    if (this.currentHotSpot && this.currentHotSpot.alive) {
      const diff = this.currentHotSpot.heightChange(this.distFromHotSpotCenter) * timeStep;
      // Multiply diff by (maxHeight - currentHeight) so points don't reach max height too fast.
      // It creates nicer visual effect.
      this.height += diff * (config.maxHeight - this.height);
      this.hotSpotActTime += timeStep;
    } else {
      this.currentHotSpot = null;
      this.distFromHotSpotCenter = null;
    }

    if (this.height > config.maxHeight) {
      this.height = config.maxHeight;
    }

    if (this.hasMelted || this.outOfBounds) {
      this.alive = false;
    }
  }
}

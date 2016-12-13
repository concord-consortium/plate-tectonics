export const OCEAN = 0;
export const CONTINENT = 1;

const SUBDUCTION_RATIO = -0.00015;
const VOLCANIC_ACT_MIN_DIST = 0;
const VOLCANIC_ACT_MAX_DIST = 60;

function subductionHeightChange(subductionDist) {
  return SUBDUCTION_RATIO * subductionDist * subductionDist;
}

export default class Point {
  constructor({ x, y, type, height, plate }) {
    // Make sure that relative coords are always positive to make other calculations easier.
    this.relX = x > plate.x ? x - plate.x : x - plate.x + plate.maxX;
    this.relY = y > plate.y ? y - plate.y : y - plate.y + plate.maxY;
    this.type = type;
    this.height = height;
    this.plate = plate;
    // Subduction properties:
    this.subductionDist = null;
    this.subductionDisplacement = null;
    this.preSubductionHeight = null;
    // Volcanic activity properties:
    this.volcanicHotSpot = false;
    this.distFromVolcanoCenter = null;
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

  get volcanicActProbability() {
    if (!this.subduction) return 0;
    const normalizedDist = (this.subductionDist - VOLCANIC_ACT_MIN_DIST) /
                           (VOLCANIC_ACT_MAX_DIST - VOLCANIC_ACT_MIN_DIST);
    return Math.pow(Math.min(1 - normalizedDist, normalizedDist) / 0.5, 7);
  }

  getRelativeVelocity(otherPoint) {
    const vxDiff = this.vx - otherPoint.vx;
    const vyDiff = this.vy - otherPoint.vy;
    return Math.sqrt(vxDiff * vxDiff + vyDiff * vyDiff);
  }

  collideWithContinent(otherPoint, timeStep) {
    if (!this.subduction) {
      this.subductionDist = 0;
      this.preSubductionHeight = this.height;
    }
    this.subductionDisplacement = this.getRelativeVelocity(otherPoint) * timeStep;
  }

  applyVolcanicActivity(hotSpot) {
    this.volcanicHotSpot = hotSpot;
    // Cache distance so we don't need to recalculate it in each simulation step.
    this.distFromVolcanoCenter = hotSpot.dist(this);
  }

  update() {
    if (this.subduction) {
      this.subductionDist += this.subductionDisplacement;
      this.height = this.preSubductionHeight + subductionHeightChange(this.subductionDist);
    }

    if (this.volcanicHotSpot && this.volcanicHotSpot.alive) {
      this.height += this.volcanicHotSpot.heightChange(this.distFromVolcanoCenter);
    } else {
      this.volcanicHotSpot = null;
      this.distFromVolcanoCenter = null;
    }

    if (this.height > 1) {
      this.height = 1;
    }
  }
}

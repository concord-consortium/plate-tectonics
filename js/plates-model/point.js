export const OCEAN = 0;
export const CONTINENT = 1;

const SUBDUCTION_RATIO = -0.00015;

function subductionHeightChange(subductionDist) {
  return SUBDUCTION_RATIO * subductionDist * subductionDist;
}

export default class Point {
  constructor({ x, y, type, height, plate, maxX, maxY }) {
    this.relX = x;
    this.relY = y;
    this.type = type;
    this.height = height;
    this.plate = plate;
    this.maxX = maxX;
    this.maxY = maxY;
    // When this value is defined, it means that point has collided with some other point.
    this.subductionDist = null;
    this.subductionDisplacement = null;
    this.preSubductionHeight = null;
  }

  get x() {
    return Math.round(this.relX + this.plate.x) % this.maxX;
  }

  get y() {
    return Math.round(this.relY + this.plate.y) % this.maxY;
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

  update() {
    if (this.subduction) {
      this.subductionDist += this.subductionDisplacement;
      this.height = this.preSubductionHeight + subductionHeightChange(this.subductionDist);
    }
  }
}

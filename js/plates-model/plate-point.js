export default class PlatePoint {
  constructor({ x, y, plate }) {
    // Make sure that relative coords are always positive and rounded to make other calculations easier.
    this.relX = Math.round(x >= plate.x ? x - Math.round(plate.x) : x - Math.round(plate.x) + plate.maxX);
    this.relY = Math.round(y >= plate.y ? y - Math.round(plate.y) : y - Math.round(plate.y) + plate.maxY);
    this.plate = plate;
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

  get speed() {
    return Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
  }

  relativeSpeed(otherPoint) {
    const vxDiff = this.vx - otherPoint.vx;
    const vyDiff = this.vy - otherPoint.vy;
    return Math.sqrt(vxDiff * vxDiff + vyDiff * vyDiff);
  }

  dist({ x, y }) {
    let xDiff = Math.abs(this.x - x);
    let yDiff = Math.abs(this.y - y);
    // Note that grid has wrapping boundaries!
    if (xDiff > this.plate.maxX * 0.5) xDiff = this.plate.maxX - xDiff;
    if (yDiff > this.plate.maxY * 0.5) yDiff = this.plate.maxY - yDiff;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }

  setPlate(plate) {
    // Update relative coords!
    const x = this.x;
    const y = this.y;
    this.relX = Math.round(x >= plate.x ? x - Math.round(plate.x) : x - Math.round(plate.x) + plate.maxX);
    this.relY = Math.round(y >= plate.y ? y - Math.round(plate.y) : y - Math.round(plate.y) + plate.maxY);
    // Finally, update plate.
    this.plate = plate;
  }
}

import config from './config';
import { mod } from '../utils';

export default class PlatePoint {
  constructor({ x, y, plate }) {
    this.plate = plate;
    this.x = x;
    this.y = y;
  }

  set x(v) {
    // Make sure that relative coords are always rounded to make other calculations easier.
    this.relX = Math.round(v - Math.round(this.plate.x));
  }

  get x() {
    if (config.wrappingBoundaries) {
      return mod(Math.round(this.relX + this.plate.x), this.plate.maxX);
    }
    return Math.round(this.relX + this.plate.x);
  }

  set y(v) {
    // Make sure that relative coords are always rounded to make other calculations easier.
    this.relY = Math.round(v - Math.round(this.plate.y));
  }

  get y() {
    if (config.wrappingBoundaries) {
      return mod(Math.round(this.relY + this.plate.y), this.plate.maxY);
    }
    return Math.round(this.relY + this.plate.y);
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

  get outOfBounds() {
    // Little optimization. Point can be out of bounds only if wrapping boundaries are disabled.
    return !config.wrappingBoundaries &&
           (this.x < 0 || this.x >= this.plate.maxX || this.y < 0 && this.y >= this.plate.maxY);
  }

  relativeSpeed(otherPoint) {
    const vxDiff = this.vx - otherPoint.vx;
    const vyDiff = this.vy - otherPoint.vy;
    return Math.sqrt(vxDiff * vxDiff + vyDiff * vyDiff);
  }

  dist({ x, y }) {
    let xDiff = Math.abs(this.x - x);
    let yDiff = Math.abs(this.y - y);
    if (config.wrappingBoundaries) {
      if (xDiff > this.plate.maxX * 0.5) xDiff = this.plate.maxX - xDiff;
      if (yDiff > this.plate.maxY * 0.5) yDiff = this.plate.maxY - yDiff;
    }
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }

  setPlate(plate) {
    const oldX = this.x;
    const oldY = this.y;
    // Update plate. That effectively changes returned (x, y) values.
    this.plate = plate;
    // Set (x, y) again to update relative coords and make sure that point stays in the same place!
    this.x = oldX;
    this.y = oldY;
  }
}

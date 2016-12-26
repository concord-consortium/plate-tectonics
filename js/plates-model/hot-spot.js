import config from './config';

// Hot spot name refers to geological hot spot. However in practice it's used to generate mountains and/or volcanoes.
// It's a circle that causes all the points lying inside to be pushed up in a way described by its function.
export default class HotSpot {
  constructor({ x, y, radius, strength, plate }) {
    // Make sure that relative coords are always positive to make other calculations easier.
    this.relX = Math.round(x >= plate.x ? x - Math.round(plate.x) : x - Math.round(plate.x) + plate.maxX);
    this.relY = Math.round(y >= plate.y ? y - Math.round(plate.y) : y - Math.round(plate.y) + plate.maxY);
    this.radius = radius;
    this.strength = strength;
    this.plate = plate;
    this.active = false;
    this.lifeLeft = config.volcanoLifeLengthRatio * radius;
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

  get x() {
    return Math.round(this.relX + this.plate.x) % this.plate.maxX;
  }

  get y() {
    return Math.round(this.relY + this.plate.y) % this.plate.maxY;
  }

  get alive() {
    return this.lifeLeft > 0;
  }

  dist({ x, y }) {
    let xDiff = Math.abs(this.x - x);
    let yDiff = Math.abs(this.y - y);
    // Note that grid has wrapping boundaries!
    if (xDiff > this.plate.maxX * 0.5) xDiff = this.plate.maxX - xDiff;
    if (yDiff > this.plate.maxY * 0.5) yDiff = this.plate.maxY - yDiff;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }

  pointInside(point) {
    return this.dist(point) < this.radius;
  }

  collides(hotSpot) {
    return this.dist(hotSpot) < this.radius + hotSpot.radius;
  }

  heightChange(dist) {
    const normDist = dist / this.radius;
    return config.volcanoHeightChangeRatio * (1 - normDist) * this.radius * this.strength;
  }

  update(timeStep) {
    this.lifeLeft -= timeStep;
  }
}

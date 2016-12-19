import config from './config';

// Hot spot name refers to geological hot spot. However in practice it's used to generate mountains and/or volcanoes.
// It's a circle that causes all the points lying inside to be pushed up in a way described by its function.
export default class HotSpot {
  constructor({ x, y, radius, strength, plate }) {
    // Make sure that relative coords are always positive to make other calculations easier.
    this.relX = Math.round(x >= plate.x ? x - plate.x : x - plate.x + plate.maxX);
    this.relY = Math.round(y >= plate.y ? y - plate.y : y - plate.y + plate.maxY);
    this.radius = radius;
    this.strength = strength;
    this.plate = plate;
    this.active = false;
    this.lifeLeft = config.volcanoLifeLengthRatio * radius;
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
    return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
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

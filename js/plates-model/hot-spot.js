import config from './config';
import PlatePoint from './plate-point';

// Hot spot name refers to geological hot spot. However in practice it's used to generate mountains and/or volcanoes.
// It's a circle that causes all the points lying inside to be pushed up in a way described by its function.
export default class HotSpot extends PlatePoint {
  constructor({ x, y, plate, radius, strength, lifeRatio = 1 }) {
    super({ x, y, plate });
    this.radius = radius;
    this.strength = strength;
    this.active = false;
    this.lifeLeft = config.hotSpotLifeLength * radius * lifeRatio;
  }

  get alive() {
    return this.lifeLeft > 0;
  }

  pointInside(point) {
    return this.dist(point) < this.radius;
  }

  collides(hotSpot) {
    return this.dist(hotSpot) < this.radius + hotSpot.radius;
  }

  heightChange(dist) {
    const normDist = dist / this.radius;
    return config.hotSpotStrength * (1 - normDist) * this.radius * this.strength;
  }

  update(timeStep) {
    this.lifeLeft -= timeStep;
  }
}

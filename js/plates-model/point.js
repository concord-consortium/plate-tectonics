export const OCEAN = 0;
export const CONTINENT = 1;

export default class Point {
  constructor({ x, y, type, height, plate, maxX, maxY }) {
    this.relX = x;
    this.relY = y;
    this.type = type;
    this.height = height;
    this.plate = plate;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  get x() {
    return Math.round(this.relX + this.plate.x) % this.maxX;
  }

  get y() {
    return Math.round(this.relY + this.plate.y) % this.maxY;
  }
}

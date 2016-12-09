export const OCEAN = 0;
export const CONTINENT = 1;

export default class Point {
  constructor(x, y, type, height, plate) {
    this.relX = x;
    this.relY = y;
    this.type = type;
    this.height = height;
    this.plate = plate;
  }

  get x() {
    return this.relX + this.plate.x;
  }

  get y() {
    return this.relY + this.plate.y;
  }
}

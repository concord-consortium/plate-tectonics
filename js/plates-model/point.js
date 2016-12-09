export default class Point {
  constructor(x, y, height, plate = null) {
    this.relX = x;
    this.relY = y;
    this.height = height;
    this.plate = plate;
  }

  get x() {
    if (this.plate) {
      return this.relX + this.plate.x;
    }
    return this.relX;
  }

  get y() {
    if (this.plate) {
      return this.relY + this.plate.y;
    }
    return this.relY;
  }
}

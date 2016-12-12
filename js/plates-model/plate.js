export default class Plate {
  constructor({ x, y, vx, vy }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.points = [];
  }

  move(timeStep) {
    this.x += this.vx * timeStep;
    this.y += this.vy * timeStep;
  }

  getBBox() {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0, len = this.points.length; i < len; i += 1) {
      const p = this.points[i];
      if (minX > p.x) minX = p.x;
      if (maxX < p.x) maxX = p.x;
      if (minY > p.y) minY = p.y;
      if (maxY < p.y) maxY = p.y;
    }
    return { minX, maxX, minY, maxY };
  }
}

export default class Plate {
  constructor({ x, y, vx, vy, maxX, maxY }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.maxX = maxX;
    this.maxY = maxY;
    this.points = [];
    this.hotSpots = [];
  }

  get inactiveHotSpots() {
    return this.hotSpots.filter(hs => !hs.active);
  }

  notEmpty() {
    return this.points.length > 0;
  }

  move(timeStep) {
    this.x += this.vx * timeStep;
    this.y += this.vy * timeStep;
    if (this.x > this.maxX) this.x = this.x % this.maxX;
    if (this.x < 0) this.x += this.maxX;
    if (this.y > this.maxY) this.y = this.y % this.maxY;
    if (this.y < 0) this.y += this.maxY;
  }

  removePointsBelow(minHeight) {
    this.points = this.points.filter(p => p.height >= minHeight);
  }

  removeDeadHotSpots() {
    this.hotSpots = this.hotSpots.filter(hs => hs.alive);
  }

  addHotSpot(newHotSpot) {
    // TODO OPTIMIZE
    // Brutal way, but it's initial test if hot spot idea works at all. If so, we should implement fast way to check
    // if hot spots are colliding and which points lie inside them (k-trees?).
    for (let i = 0, len = this.hotSpots.length; i < len; i += 1) {
      if (this.hotSpots[i].collides(newHotSpot)) return;
    }
    this.hotSpots.push(newHotSpot);
  }

  getDisplacement(timeStep) {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy) * timeStep;
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

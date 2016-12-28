let id = -1;
function getPlateID() {
  id += 1;
  return id;
}

export default class Plate {
  constructor({ x = 0, y = 0, vx = 0, vy = 0, maxX, maxY, pinned = false }) {
    this.id = getPlateID();
    this.pinned = pinned;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.maxX = maxX;
    this.maxY = maxY;
    this.points = [];
    this.hotSpots = [];
    // It means that plate consist of a single continent. It's necessary when continents are colliding.
    this.continentOnly = true;
  }

  set vx(v) {
    this._vx = this.pinned ? 0 : v;
  }

  get vx() {
    return this._vx;
  }

  set vy(v) {
    this._vy = this.pinned ? 0 : v;
  }

  get vy() {
    return this._vy;
  }

  set pinned(v) {
    this._pinned = v;
    if (v) {
      this.vx = 0;
      this.vy = 0;
    }
  }

  get pinned() {
    return this._pinned;
  }

  get size() {
    return this.points.length;
  }

  extractContinent(continentPoints) {
    const { x, y, vx, vy, maxX, maxY } = this;
    // Create a new plate.
    const newPlate = new Plate({ x, y, vx, vy, maxX, maxY });
    newPlate.points = continentPoints;
    newPlate.continentOnly = true;
    continentPoints.forEach((p) => { p.plate = newPlate; });
    // Update our own point list.
    this.points = this.points.filter(p => p.plate === this);
    return newPlate;
  }

  merge(plate) {
    plate.points.forEach((p) => {
      p.setPlate(this);
      this.addPoint(p);
    });
    plate.hotSpots.forEach((hs) => {
      hs.setPlate(this);
      this.hotSpots.push(hs);
    });
    plate.points = [];
  }

  get inactiveHotSpots() {
    return this.hotSpots.filter(hs => !hs.active);
  }

  notEmpty() {
    return this.points.length > 0;
  }

  addPoint(p) {
    this.points.push(p);
    if (this.continentOnly && p.isOcean) {
      this.continentOnly = false;
    }
  }

  move(timeStep) {
    if (this.pinned) return;
    this.x += this.vx * timeStep;
    this.y += this.vy * timeStep;
    if (this.x > this.maxX) this.x = this.x % this.maxX;
    if (this.x < 0) this.x += this.maxX;
    if (this.y > this.maxY) this.y = this.y % this.maxY;
    if (this.y < 0) this.y += this.maxY;
  }

  removeDeadPoints() {
    this.points = this.points.filter(p => p.alive);
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

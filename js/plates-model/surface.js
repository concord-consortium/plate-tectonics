import bs from 'binarysearch';

function getTestData(width, height) {
  const data = [];
  for (let i = 0; i < width; i += 1) {
    const row = [];
    data.push(row);
    for (let j = 0; j < height; j += 1) {
      row.push(((j / height) * 2) - 1); // [-1, 1] range
    }
  }
  return data;
}

function getGrid(width, height) {
  const data = [];
  for (let i = 0; i < width; i += 1) {
    const row = new Array(height);
    data.push(row);
  }
  return data;
}

function sortByHeightDesc(a, b) {
  return b.height - a.height;
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export default class Surface {
  constructor({ width, height }) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.maxHeight = getGrid(this.width, this.height);
    this.points = getGrid(this.width, this.height);
  }

  setPoint(point) {
    if (!this.maxHeight[point.x][point.y] || this.maxHeight[point.x][point.y] < point.height) {
      this.maxHeight[point.x][point.y] = point.height;
    }
    if (!this.points[point.x][point.y]) {
      this.points[point.x][point.y] = [point];
    } else {
      // Collision!
      bs.insert(this.points[point.x][point.y], point, sortByHeightDesc);
    }
  }

  getSurfacePoint(x, y) {
    // Points are ordered from highest to lowest. See #setPoint.
    return this.points[x][y] && this.points[x][y][0];
  }

  getSurfacePointsWithinRadius(cx, cy, radius) {
    const result = [];
    const minX = Math.max(0, Math.floor(cx - radius));
    const minY = Math.max(0, Math.floor(cy - radius));
    const maxX = Math.min(this.width, Math.ceil(cx + radius));
    const maxY = Math.min(this.height, Math.ceil(cy + radius));
    for (let x = minX; x < maxX; x += 1) {
      for (let y = minY; y < maxY; y += 1) {
        if (this.points[x][y] && dist(x, y, cx, cy) <= radius) {
          result.push(this.points[x][y][0]);
        }
      }
    }
    return result;
  }

  forEachCollision(callback) {
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        if (this.points[x][y] && this.points[x][y].length > 1) {
          callback(this.points[x][y]);
        }
      }
    }
  }
}

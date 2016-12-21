import bs from 'binarysearch';

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
  constructor({ width, height, plates = [] }) {
    this.width = width;
    this.height = height;
    this.points = getGrid(width, height);

    plates.forEach((plate) => {
      const points = plate.points;
      for (let i = 0, len = points.length; i < len; i += 1) {
        this.setPoint(points[i]);
      }
    });
  }

  setPoint(point) {
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

  forEachPoint(callback) {
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        const points = this.points[x][y];
        if (points) {
          for (let i = 0; i < points.length; i += 1) {
            callback(points[i]);
          }
        }
      }
    }
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

  forEachPlatePointWithinRadius(plate, cx, cy, radius, callback) {
    const minX = Math.floor(cx - radius);
    const minY = Math.floor(cy - radius);
    const maxX = Math.floor(cx + radius);
    const maxY = Math.floor(cy + radius);
    // const minX = Math.max(0, Math.floor(cx - radius));
    // const minY = Math.max(0, Math.floor(cy - radius));
    // const maxX = Math.min(this.width, Math.ceil(cx + radius));
    // const maxY = Math.min(this.height, Math.ceil(cy + radius));
    for (let x = minX; x < maxX; x += 1) {
      for (let y = minY; y < maxY; y += 1) {
        const xr = (x + this.width) % this.width;
        const yr = (y + this.height) % this.height;
        if (this.points[xr][yr] && dist(x, y, cx, cy) <= radius) {
          const points = this.points[xr][yr];
          for (let i = 0; i < points.length; i += 1) {
            if (points[i].plate === plate) {
              callback(points[i]);
              break;
            }
          }
        }
      }
    }
  }
}

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

export default class Surface {
  constructor(options) {
    this.maxHeight = getGrid(options.width, options.height);
    this.points = getGrid(options.width, options.height);
  }

  setPoint(point) {
    if (!this.maxHeight[point.x][point.y] || this.maxHeight[point.x][point.y] < point.height) {
      this.maxHeight[point.x][point.y] = point.height;
    }
    if (!this.points[point.x][point.y]) {
      this.points[point.x][point.y] = [point];
    } else {
      bs.insert(this.points, point, sortByHeightDesc);
    }
  }
}

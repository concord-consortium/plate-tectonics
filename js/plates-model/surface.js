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

function getGrid(width) {
  const data = [];
  for (let i = 0; i < width; i += 1) {
    const row = [];
    data.push(row);
  }
  return data;
}


export default class Surface {
  constructor(options) {
    this.data = getGrid(options.width, options.height);
  }

  setPoint(point) {
    if (!this.data[point.x][point.y] || this.data[point.x][point.y] < point.height) {
      this.data[point.x][point.y] = point.height;
    }
  }
}

import Surface from './surface';
import Point from './point';
import Plate from './plate';

export const MIN_HEIGHT = -1;
export const MAX_HEIGHT = 1;

function generatePlate(minX, maxX, minY, maxY, height) {
  const plate = new Plate(0, 0);
  for (let x = minX; x < maxX; x += 1) {
    for (let y = minY; y < maxY; y += 1) {
      const point = new Point(x, y, height, plate);
      plate.points.push(point);
    }
  }
  return plate;
}

export default class Model {
  constructor(options) {
    this.options = options;
    this.canvas = options.canvas;
    this.surface = new Surface({
      width: options.width,
      height: options.height,
    });
    this.plates = [];
    this.testInit();
  }

  step() {
    this.updateSurfaceHeight();
  }

  get data() {
    return this.surface.data;
  }

  updateSurfaceHeight() {
    this.plates.forEach((plate) => {
      const points = plate.points;
      for (let i = 0, len = points.length; i < len; i += 1) {
        this.surface.setPoint(points[i]);
      }
    });
  }

  testInit() {
    const { width, height } = this.options;
    const ocean = generatePlate(0, width * 0.5, 0, height, -0.5);
    const continent = generatePlate(width * 0.5, width, 0, height, 0.01);
    this.plates.push(ocean);
    this.plates.push(continent);
  }
}

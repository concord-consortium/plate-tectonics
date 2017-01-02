import Point from '../../plates-model/point';
import config from '../../plates-model/config';

const defPlate = { x: 50, y: 51, maxX: 100, maxY: 100 };
const defConfig = { x: defPlate.x + 10, y: defPlate.y + 10, plate: defPlate };

describe('Point', () => {
  test('Coordinates are relative to plate coordinates', () => {
    const plate = { x: 50, y: 51, maxX: 100, maxY: 100 };
    const p1 = new Point({ x: plate.x + 10, y: plate.y + 10, plate });
    expect(p1.x).toEqual(plate.x + 10);
    expect(p1.relX).toEqual(10);
    expect(p1.y).toEqual(plate.y + 10);
    expect(p1.relY).toEqual(10);
    const p2 = new Point({ x: plate.x - 10, y: plate.y - 10, plate });
    expect(p2.x).toEqual(plate.x - 10);
    expect(p2.relX).toEqual(-10);
    expect(p2.y).toEqual(plate.y - 10);
    expect(p2.relY).toEqual(-10);
    // Move plate.
    plate.x += 1000;
    plate.y += 1000;
    expect(p1.x).toEqual(60);
    expect(p1.y).toEqual(61);
    plate.x -= 1000;
    plate.y -= 1000;
    expect(p1.x).toEqual(60);
    expect(p1.y).toEqual(61);
  });

  test('Coordinates are always rounded (especially relative coordinates)', () => {
    const plateFloat = { x: 50.3, y: 50.7, maxX: 100, maxY: 100 };
    const p1 = new Point({ x: plateFloat.x + 10, y: plateFloat.y + 10, plate: plateFloat });
    expect(p1.x).toEqual(Math.round(plateFloat.x + 10));
    expect(p1.relX).toEqual(10);
    expect(p1.y).toEqual(Math.round(plateFloat.y + 10));
    expect(p1.relY).toEqual(10);
    const p2 = new Point({ x: plateFloat.x - 10, y: plateFloat.y - 10, plate: plateFloat });
    expect(p2.x).toEqual(Math.round(plateFloat.x - 10));
    expect(p2.relX).toEqual(-10);
    expect(p2.y).toEqual(Math.round(plateFloat.y - 10));
    expect(p2.relY).toEqual(-10);
    const plateFloat2 = { x: 50.5, y: 50.5, maxX: 100, maxY: 100 };
    const p3 = new Point({ x: 0, y: 0, plate: plateFloat2 });
    expect(p3.x).toEqual(0);
    expect(p3.y).toEqual(0);
  });

  test('Volcanic activity probability changes within subduction area', () => {
    const p = new Point(defConfig);
    expect(p.volcanicActProbability).toEqual(0);
    p.subductionDist = config.volcanicActMinDist;
    expect(p.volcanicActProbability).toEqual(0);
    p.subductionDist = config.volcanicActMinDist + 0.2 * (config.volcanicActMaxDist - config.volcanicActMinDist);
    expect(p.volcanicActProbability).toBeGreaterThan(0);
    expect(p.volcanicActProbability).toBeLessThan(1);
    // Middle of subduction area.
    p.subductionDist = config.volcanicActMinDist + 0.5 * (config.volcanicActMaxDist - config.volcanicActMinDist);
    expect(p.volcanicActProbability).toEqual(1);
    p.subductionDist = config.volcanicActMinDist + 0.8 * (config.volcanicActMaxDist - config.volcanicActMinDist);
    expect(p.volcanicActProbability).toBeGreaterThan(0);
    expect(p.volcanicActProbability).toBeLessThan(1);
    p.subductionDist = config.volcanicActMaxDist;
    expect(p.volcanicActProbability).toEqual(0);
  });
});

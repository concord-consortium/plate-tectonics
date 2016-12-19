import Point, { VOLCANIC_ACT_MIN_DIST, VOLCANIC_ACT_MAX_DIST } from '../../plates-model/point';

const plate = { x: 50, y: 51, maxX: 100, maxY: 100 };
const defConfig = { x: plate.x + 10, y: plate.y + 10, plate };

describe('Point', () => {
  test('Coordinates are relative to plate coordinates', () => {
    const p1 = new Point({ x: plate.x + 10, y: plate.y + 10, plate });
    expect(p1.x).toEqual(plate.x + 10);
    expect(p1.relX).toEqual(10);
    expect(p1.y).toEqual(plate.y + 10);
    expect(p1.relY).toEqual(10);
    const p2 = new Point({ x: plate.x - 10, y: plate.y - 10, plate });
    expect(p2.x).toEqual(plate.x - 10);
    expect(p2.relX).toEqual(plate.maxX - 10);
    expect(p2.y).toEqual(plate.y - 10);
    expect(p2.relY).toEqual(plate.maxY - 10);
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
    expect(p2.relX).toEqual(plateFloat.maxX - 10);
    expect(p2.y).toEqual(Math.round(plateFloat.y - 10));
    expect(p2.relY).toEqual(plateFloat.maxY - 10);
  });

  test('Volcanic activity probability changes within subduction area', () => {
    const p = new Point(defConfig);
    expect(p.volcanicActProbability).toEqual(0);
    p.subductionDist = VOLCANIC_ACT_MIN_DIST;
    expect(p.volcanicActProbability).toEqual(0);
    p.subductionDist = VOLCANIC_ACT_MIN_DIST + 0.2 * (VOLCANIC_ACT_MAX_DIST - VOLCANIC_ACT_MIN_DIST);
    expect(p.volcanicActProbability).toBeGreaterThan(0);
    expect(p.volcanicActProbability).toBeLessThan(1);
    // Middle of subduction area.
    p.subductionDist = VOLCANIC_ACT_MIN_DIST + 0.5 * (VOLCANIC_ACT_MAX_DIST - VOLCANIC_ACT_MIN_DIST);
    expect(p.volcanicActProbability).toEqual(1);
    p.subductionDist = VOLCANIC_ACT_MIN_DIST + 0.8 * (VOLCANIC_ACT_MAX_DIST - VOLCANIC_ACT_MIN_DIST);
    expect(p.volcanicActProbability).toBeGreaterThan(0);
    expect(p.volcanicActProbability).toBeLessThan(1);
    p.subductionDist = VOLCANIC_ACT_MAX_DIST;
    expect(p.volcanicActProbability).toEqual(0);
  });
});

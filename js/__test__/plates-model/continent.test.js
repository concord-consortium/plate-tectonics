import { continentalCollision } from '../../plates-model/initializers';
import Surface from '../../plates-model/surface';
import { calcContinents } from '../../plates-model/continent';

describe('Continent calculation', () => {
  test('continentalCollision preset should consist of two continents', () => {
    const width = 512;
    const height = 512;
    const plates = continentalCollision(width, height);
    const surface = new Surface({ width, height, plates });
    const continents = calcContinents(surface);
    expect(continents.length).toEqual(2);
  });
});

import img2plates from '../img-2-plates';
import test1src from '../../../data/test1.png';

export function test1(callback) {
  img2plates(test1src, (plates) => {
    plates[1].vx = -1;
    plates[2].vx = 1;
    plates[3].vx = -1.3;
    callback(plates);
  });
}

export function test2() {
  // Keep this placeholder so ESLint doesn't complain about default export.
  // Once we add a second function, the problem will be solved...
}

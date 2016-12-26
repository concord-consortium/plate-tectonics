import img2plates from '../img-2-plates';
import test1src from '../../../data/test1.png';

export function test1(callback) {
  img2plates(test1src, (plates) => {
    callback(plates);
  });
}

export function test2() {
  // TODO
}

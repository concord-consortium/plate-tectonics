import img2plates from './img-2-plates';
import test1Src from '../../data/test1.png';
import test2Src from '../../data/test2.png';
import test3Src from '../../data/test3.png';
import test4Src from '../../data/test4.png';
import islandsSrc from '../../data/islands.png';
import islandCollisionSrc from '../../data/islandCollision.png';
import continentCollisionSrc from '../../data/continentCollision.png';
import oceanRidgeSrc from '../../data/oceanRidge.png';

export function test1(callback) {
  img2plates(test1Src, (plates) => {
    plates[1].vx = -1;
    plates[2].vx = 1;
    plates[3].vx = -1.3;
    callback(plates);
  });
}

export function test2(callback) {
  img2plates(test2Src, (plates) => {
    plates[1].vx = -1;
    plates[2].vx = 1;
    plates[3].vx = -1.3;
    callback(plates);
  });
}

export function test3(callback) {
  img2plates(test3Src, (plates) => {
    plates[0].vy = 1;
    plates[1].vy = -0.5;
    plates[2].vy = 0.5;
    plates[3].vy = -0.5;
    plates[4].vy = 0.5;
    callback(plates);
  });
}

export function test4(callback) {
  img2plates(test4Src, (plates) => {
    plates[0].vx = 1;
    plates[0].vy = 1;
    plates[1].vx = -1;
    plates[2].vx = 1;
    plates[2].vy = -1;
    plates[3].vx = 1;
    plates[3].vy = -1;
    plates[4].vx = -1;
    plates[4].vy = 1;
    callback(plates);
  });
}

export function test4pinned(callback) {
  img2plates(test4Src, (plates) => {
    plates[0].pinned = true;
    plates[1].vx = -2;
    plates[2].vx = 2;
    plates[2].vy = -2;
    plates[3].vx = 2;
    plates[3].vy = -2;
    plates[4].pinned = true;
    callback(plates);
  });
}

export function islands(callback) {
  img2plates(islandsSrc, (plates) => {
    plates[0].vx = 3;
    plates[1].vx = 0;
    callback(plates);
  });
}

export function islandCollision(callback) {
  img2plates(islandCollisionSrc, (plates) => {
    plates[0].vx = 2;
    callback(plates);
  });
}

export function continentCollision(callback) {
  img2plates(continentCollisionSrc, (plates) => {
    plates[0].vx = 2;
    callback(plates);
  });
}

export function oceanRidge(callback) {
  img2plates(oceanRidgeSrc, (plates) => {
    plates[1].vx = -1;
    plates[2].vx = 1;
    callback(plates);
  });
}

import test1Src from '../../data/test1.png';
import test1RectSrc from '../../data/test1rect.png';
import test2Src from '../../data/test2.png';
import test3Src from '../../data/test3.png';
import test4Src from '../../data/test4.png';
import islandsSrc from '../../data/islands.png';
import islandCollisionSrc from '../../data/islandCollision.png';
import continentCollisionSrc from '../../data/continentCollision.png';
import oceanRidgeSrc from '../../data/oceanRidge.png';
import subductionIssueSrc from '../../data/subductionIssue.png';

export default {
  continentCollision: {
    img: continentCollisionSrc,
    init: (plates) => {
      plates[0].vx = 2;
    },
  },
  oceanRidge: {
    img: oceanRidgeSrc,
    init: (plates) => {
      plates[1].vx = -1;
      plates[2].vx = 1;
    },
  },
  islands: {
    img: islandsSrc,
    init: (plates) => {
      plates[0].vx = 3;
      plates[1].vx = 0;
    },
  },
  islandCollision: {
    img: islandCollisionSrc,
    init: (plates) => {
      plates[0].vx = 2;
    },
  },
  subductionIssue1: {
    img: subductionIssueSrc,
    init: (plates) => {
      plates[0].vx = 2;
      plates[1].vx = 0;
    },
  },
  subductionIssue2: {
    img: subductionIssueSrc,
    init: (plates) => {
      plates[0].vx = 0;
      plates[1].vx = -2;
    },
  },
  // test1-4 are implementation of initial Amy's ideas, described here:
  // https://drive.google.com/open?id=0B4CijKAWlpBtVFpHVVRjQWh5LTQ
  test1: {
    img: test1Src,
    init: (plates) => {
      plates[1].vx = -1;
      plates[2].vx = 1;
      plates[2].subductionIdx = 100;
      plates[3].vx = -1.3;
    },
  },
  test1rect: {
    img: test1RectSrc,
    init: (plates) => {
      plates[1].vx = -1;
      plates[2].vx = 1;
      plates[2].subductionIdx = 100;
      plates[3].vx = -1.3;
    },
  },
  test2: {
    img: test2Src,
    init: (plates) => {
      plates[1].vx = -1;
      plates[2].vx = 1;
      plates[2].subductionIdx = 100;
      plates[3].vx = -1.3;
    },
  },
  test3: {
    img: test3Src,
    init: (plates) => {
      plates[0].vy = 1;
      plates[1].vy = -0.5;
      plates[2].vy = 0.5;
      plates[3].vy = -0.5;
      plates[4].vy = 0.5;
    },
  },
  test4: {
    img: test4Src,
    init: (plates) => {
      plates[0].vx = 1;
      plates[0].vy = 1;
      plates[1].vx = -1;
      plates[2].vx = 1;
      plates[2].vy = -1;
      plates[3].vx = 1;
      plates[3].vy = -1;
      plates[4].vx = -1;
      plates[4].vy = 1;
    },
  },
  test4Pinned: {
    img: test4Src,
    init: (plates) => {
      plates[0].pinned = true;
      plates[1].vx = -1;
      plates[2].vx = 1;
      plates[2].vy = -1;
      plates[3].vx = 1;
      plates[3].vy = -1;
      plates[4].pinned = true;
    },
  },
};

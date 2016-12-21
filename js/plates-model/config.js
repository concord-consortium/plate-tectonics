import colormap from 'colormap';
import { shuffle, getURLParam } from '../utils';

const PLATE_COLOR = shuffle(colormap({
  colormap: 'cubehelix', // pick a builtin colormap or add your own
  nshades: 200,          // how many divisions
  format: 'rgb',         // "hex" or "rgb" or "rgbaString"
  alpha: 1,
}));

const DEFAULT_CONFIG = {
  minHeight: -1,
  maxHeight: 1,
  waterLevel: 0,
  // Height (or thickness) of the new oceanic crust. In fact height of the oceanic ridge around divergent boundary.
  newOceanHeight: -0.5,
  // When oceanic crust cools down, it sinks a bit.
  oceanicCrustCoolingRatio: 0.025,
  oceanicCrustCoolingTime: 3,
  // Speed of subduction.
  subductionRatio: 0.00015,
  // Volcanoes are created between min and max distance from convergent boundary.
  volcanicActMinDist: 20,
  volcanicActMaxDist: 70,
  // Limit amount of time that given point can undergo volcanic activity.
  volcanicActMaxTime: 100,
  // Strength of volcanic activity.
  volcanoHeightChangeRatio: 0.0008,
  // Volcano lifespan is proportional to this value and its diameter.
  volcanoLifeLengthRatio: 0.5,
  // Controls how fast continents would slow down when they are colliding.
  continentCollisionFriction: 0.00001,
  // Visual settings.
  plateColor: PLATE_COLOR,
};

const urlConfig = {};

Object.keys(DEFAULT_CONFIG).forEach((key) => {
  const urlValue = getURLParam(key);
  if (urlValue === 'true') {
    urlConfig[key] = true;
  } else if (urlValue === 'false') {
    urlConfig[key] = false;
  } else if (urlValue !== null && !isNaN(urlValue)) {
    // !isNaN(string) means isNumber(string).
    urlConfig[key] = parseFloat(urlValue);
  } else if (urlValue !== null) {
    urlConfig[key] = urlValue;
  }
});

const finalConfig = Object.assign({}, DEFAULT_CONFIG, urlConfig);
export default finalConfig;

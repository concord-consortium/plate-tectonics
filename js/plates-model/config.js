import colormap from 'colormap';
import { shuffle, getURLParam } from '../utils';

const PLATE_COLOR = shuffle(colormap({
  colormap: 'cubehelix', // pick a builtin colormap or add your own
  nshades: 100,          // how many divisions
  format: 'rgb',         // "hex" or "rgb" or "rgbaString"
  alpha: 1,
}));

const DEFAULT_CONFIG = {
  minHeight: -1,
  maxHeight: 1,
  waterLevel: 0,
  // Height (or thickness) of the new oceanic crust. In fact height of the oceanic ridge around divergent boundary.
  newOceanHeight: -0.3,
  // When oceanic crust cools down, it sinks a bit.
  oceanicCrustCoolingRatio: 0.1,
  oceanicCrustCoolingTime: 3,
  // If heightBasedSubduction === true, always the higher point will go above lower point.
  // Otherwise, every point from one plate will subduct, no matter what is the current height.
  // It ensures consistent subduction across the whole boundary.
  heightBasedSubduction: true,
  // Elevation of the oceanic plate at the beginning of subduction.
  subductionHeight: -0.6,
  // Speed of subduction.
  subductionRatio: 0.00015,
  // Strength of volcanic activity related to subduction.
  volcanicActStrength: 1,
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
  continentCollisionFriction: 10000,
  // Plates are merged when they are overlapping and the difference between their velocities is smaller than this value.
  platesMergeSpeedDiff: 0.5,
  // Controls whether given piece of land is treated as an island or continent. Islands are detached from its plates
  // during collision with other island or continents. Continents are not and they will slow down the whole plate.
  // Ratio equal to 0.5 means that land smaller than 0.5 * plate.size is treated as island.
  islandRatio: 0.3,
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

import { getURLParam } from '../utils';

const DEFAULT_CONFIG = {
  wrappingBoundaries: true,
  minHeight: -1,
  maxHeight: 1,
  waterLevel: 0,
  // Height (or thickness) of the new oceanic crust. In fact height of the oceanic ridge around divergent boundary.
  newOceanHeight: -0.3,
  // When oceanic crust cools down, it sinks a bit.
  oceanicCrustCoolingRatio: 0.0333,
  // If heightBasedSubduction === true, always the higher point will go above lower point.
  // Otherwise, every point from one plate will subduct, no matter what is the current height.
  // It ensures consistent subduction across the whole boundary.
  heightBasedSubduction: false,
  // Elevation of the oceanic plate at the beginning of subduction.
  subductionHeight: -0.6,
  // Speed of subduction.
  subductionRatio: 0.00015,
  // Strength of orogeny related to collision between continents.
  orogenyStrength: 40,
  // Strength of volcanic activity related to subduction.
  volcanicActStrength: 1.5,
  // Volcanoes are created between min and max distance from convergent boundary.
  volcanicActMinDist: 5,
  volcanicActMaxDist: 30,
  // Limit amount of time that given point can undergo orogenesis or volcanic activity.
  hotSpotActMaxTime: 100,
  // Strength of orogenesis or volcanic activity.
  hotSpotStrength: 0.002,
  // Volcano lifespan is proportional to this value and its diameter.
  hotSpotLifeLength: 0.5,
  // Controls how fast continents would slow down when they are colliding.
  continentCollisionFriction: 6,
  // Plates are merged together when they are overlapping and the difference between their speed is smaller
  // than this value. Note that big plates are not merged, the model just makes sure that their velocity is the same.
  platesMergeSpeedDiff: 0.3,
  // Plates smaller than this value * model width * model size would be merged into other plates. E.g. small islands
  // colliding with big continents will join them.
  mergePlateRatio: 0.05,
  // Controls whether given piece of land is treated as an island or continent. Islands are detached from its plates
  // during collision with other island or continents. Continents are not and they will slow down the whole plate.
  // Ratio equal to 0.1 means that land smaller than 0.1 * plate.size is treated as island.
  islandRatio: 0.05,
  // Visual settings.
  elevationColormap: 'topo', // or 'heat', check colormaps.js
  plateColormap: 'default',
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

import colormap from 'colormap';
import { scaleLinear } from 'd3-scale';
import { interpolateHcl } from 'd3-interpolate';
import { rgb } from 'd3-color';
import config from './config';

const N_SHADES = 1000;

export const ERROR_COL = [255, 0, 0];
export const NO_PLATE_COL = [220, 220, 220];
export const BOUNDARY_COL = {
  default: [16, 16, 16],
  convergent: [255, 38, 32],
  divergent: [255, 196, 0],
  transform: [79, 230, 75],
};

function d3ScaleToArray(d3Scale, shadesCount) {
  const result = [];
  for (let i = 0; i < shadesCount; i += 1) {
    const c = rgb(d3Scale(i / shadesCount));
    result.push([c.r, c.g, c.b]);
  }
  return result;
}

function d3Colormap(desc, shadesCount = null) {
  const keys = Object.keys(desc).sort();
  if (!shadesCount) shadesCount = keys.length;
  const colors = keys.map(k => desc[k]);
  const d3Scale = scaleLinear()
    .domain(keys)
    .range(colors)
    .interpolate(interpolateHcl);
  return d3ScaleToArray(d3Scale, shadesCount);
}

const elevationColormap = {
  heat: colormap({
    colormap: 'jet',   // pick a builtin colormap or add your own
    nshades: N_SHADES, // how many divisions
    format: 'rgb',     // "hex" or "rgb" or "rgbaString"
    alpha: 1,
  }),

  // https://gist.github.com/hugolpz/4351d8f1b3da93de2c61
  // https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Maps/Conventions#Topographic_maps
  topo: d3Colormap({
    0.00: '#004e83',
    0.20: '#3696d8',
    0.49: '#b5ebfe',
    0.50: '#ACD0A5',
    0.55: '#94BF8B',
    0.60: '#A8C68F',
    0.65: '#BDCC96',
    0.70: '#EFEBC0',
    0.75: '#DED6A3',
    0.80: '#AA8753',
    0.85: '#AC9A7C',
    0.90: '#CAC3B8',
    0.99: '#F5F4F2',
    1.00: '#FFFFFF',
  }, N_SHADES),
};

const plateColormap = {
  // https://github.com/d3/d3-scale/blob/master/README.md#schemeCategory20
  default: d3Colormap({
    0.0: '#1f77b4',
    0.1: '#2ca02c',
    0.2: '#ff9896',
    0.3: '#9467bd',
    0.4: '#8c564b',
    0.5: '#bcbd22',
    0.6: '#17becf',
    0.7: '#d6616b',
    0.8: '#dbdb8d',
    0.9: '#c7c7c7',
  }),
};

export function elevationColor(val) {
  if (val == null) {
    return ERROR_COL;
  }
  const colMap = elevationColormap[config.elevationColormap];
  const shadesCount = colMap.length;
  // It should not happen. Mark those points using red color. Usually it means there's some error.
  const shade = Math.floor((val - config.minHeight) / (config.maxHeight - config.minHeight) * (shadesCount - 1));
  if (shade < 0 || shade >= shadesCount) {
    return ERROR_COL;
  }
  return colMap[shade];
}

export function plateColor(plateId) {
  const colMap = plateColormap[config.plateColormap];
  return colMap[plateId % colMap.length];
}

import colormap from 'colormap';
import { scaleLinear, scaleOrdinal, schemeCategory10 } from 'd3-scale';
import { interpolateHcl } from 'd3-interpolate';
import { rgb } from 'd3-color';
import config from './config';

const N_SHADES = 1000;

export const ERROR_COL = [255, 0, 0];
export const NO_PLATE_COL = [220, 220, 220];
export const BOUNDARY_COL = {
  default: [16, 16, 16],
  convergent: [255, 0, 0],
  divergent: [255, 255, 0],
  transform: [0, 255, 0],
};

function d3ScaleToArray(d3Scale) {
  const result = [];
  for (let i = 0; i < N_SHADES; i += 1) {
    const c = rgb(d3Scale(i / N_SHADES));
    result.push([c.r, c.g, c.b]);
  }
  return result;
}

function d3Colormap(desc) {
  const keys = Object.keys(desc).sort();
  const colors = keys.map(k => desc[k]);
  const d3Scale = scaleLinear()
    .domain(keys)
    .range(colors)
    .interpolate(interpolateHcl);
  return d3ScaleToArray(d3Scale);
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
  }),
};

const plateColormap = {
  // https://github.com/d3/d3-scale/blob/master/README.md#schemeCategory20
  default: d3ScaleToArray(scaleOrdinal(schemeCategory10)),
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

const fs = require('fs');
// const cv = require('opencv4nodejs');
import { head, tail } from 'lodash';
import { dot, add, multiply, size } from 'mathjs';

export const PIXEL_MAP_DOME_SMOL = Object.values(
  JSON.parse(fs.readFileSync('test_data/pixel_map_smol.json', 'utf8'))
);
export const PIXEL_MAP_DOME_BIG = Object.values(
  JSON.parse(fs.readFileSync('test_data/pixel_map_big.json', 'utf8'))
);
export const PIXEL_MAP_DOME_OUTER = Object.values(
  JSON.parse(fs.readFileSync('test_data/pixel_map_outer.json', 'utf8'))
);
export const PIXEL_MAP_DOME_OUTER_FLIP = Object.values(
  JSON.parse(fs.readFileSync('test_data/pixel_map_outer_flip.json', 'utf8'))
);

// Return a normalized copy of `pixel map` all x, y between 0, 1.
export const normalizePixMap = pixMap => {
  if (size(pixMap)[1] != 2) {
    throw new Error(
      `pixMap should be an array of 2d vectors, instead it has size ${JSON.stringify(size(pixMap))}`
    );
  }

  let [pixMinX, pixMaxX, pixMinY, pixMaxY] = [Infinity, -Infinity, Infinity, -Infinity];
  pixMap.forEach(([x, y]) => {
    if (x < pixMinX) pixMinX = x;
    if (x > pixMaxX) pixMaxX = x;
    if (y < pixMinY) pixMinY = y;
    if (y > pixMaxY) pixMaxY = y;
  });

  const [pixBreadthX, pixBreadthY] = [pixMaxX - pixMinX, pixMaxY - pixMinY];
  const pixBreadthMax = Math.max(pixBreadthX, pixBreadthY);

  // console.log(
  //   `mins: (${pixMinX}, ${pixMinY}), maxs: (${pixMaxX}, ${pixMaxY}), breadth ${pixBreadthMax}`
  // );

  return pixMap.map(([x, y]) => {
    return [(x - pixMinX) / pixBreadthMax, (y - pixMinY) / pixBreadthMax];
  });
};

export const MAPS_DOME_SIMPLIFIED = {
  smol: normalizePixMap(PIXEL_MAP_DOME_SMOL),
  big: normalizePixMap(PIXEL_MAP_DOME_BIG)
};

export const PANELS_DOME_SIMPLIFIED = {
  0: { 0: 'big', 1: 'smol', 2: 'smol', 3: 'smol' },
  1: { 0: 'big', 1: 'smol', 2: 'smol', 3: 'smol' },
  2: { 0: 'big', 1: 'smol', 2: 'smol', 3: 'smol' },
  3: { 0: 'big', 1: 'smol', 2: 'smol', 3: 'smol' },
  4: { 0: 'big', 1: 'smol', 2: 'smol', 3: 'smol' }
};

export const MAPS_DOME = {
  smol: normalizePixMap(PIXEL_MAP_DOME_SMOL),
  big: normalizePixMap(PIXEL_MAP_DOME_BIG),
  outer: normalizePixMap(PIXEL_MAP_DOME_OUTER),
  outer_flip: normalizePixMap(PIXEL_MAP_DOME_OUTER_FLIP)
};

/**
 * Convert from radians to degrees
 * @param {Number} angle Angle in radians
 */
export const degreesToRadians = angle => {
  return (angle * Math.PI) / 180;
};

/**
 * Generate a rotation matrix from the angle in degrees.
 * @param {Number} angle (degrees)
 */
export const matRotation2D = angle => {
  const theta = degreesToRadians(angle);
  const [val_cos, val_sin] = [Math.cos(theta), Math.sin(theta)];
  return [[val_cos, -val_sin], [val_sin, val_cos]];
};

/**
 * Generate a scale matrix from the scalar.
 * @param {Number} scalar The scale amount.
 */
export const matScale2D = scalar => {
  return [[scalar, 0], [0, scalar]];
};

/**
 * Generate a scale matrix in the y direction from the scalar
 * @param {Number} scalar
 */
export const matScale2DY = scalar => {
  return [[1, 0], [0, scalar]];
};

export const matMult = (...matrices) => {
  return tail(matrices).reduce((result, matrix) => multiply(result, matrix), head(matrices));
};

/**
 * Transform a vector using a transformation matrix
 * @param {Array} vector
 * @param {Array} matrix transformation matrix
 */
export const vectorTransform = function(vector, matrix) {
  // console.log(`vector ${JSON.stringify(vector)}`);
  // console.log(`matrix ${JSON.stringify(matrix)}`);
  return matrix.map(row => {
    try {
      return dot(row, vector);
    } catch (err) {
      throw new Error(
        `err ${err} vector ${JSON.stringify(vector)} matrix ${JSON.stringify(matrix)}`
      );
    }
  });
};

/**
 * Rotate a 2D vector by a given angle
 * @param {Array} vector
 * @param {Number} angle in degrees
 */
export const rotateVector = (vector, angle) => {
  // console.log(`vector ${vector}`);
  // console.log(`angle ${angle}`);
  return vectorTransform(vector, matRotation2D(angle));
};

/**
 * Transform each coordinate in a mapping by a matrix
 * @param {Array} mapping
 * @param {Array} mat the transformation matrix
 */
export const transformMapping = (mapping, mat) => {
  // console.log(`mat ${mat}`);
  return mapping.map(coordinate => vectorTransform(coordinate, mat));
};

/**
 * Scale each coordinate in a mapping by a scalar, or a matrix
 * @param {Array} mapping
 * @param {Array} offset
 */
export const scaleMapping = (mapping, scale) => {
  if (typeof scale == 'number') {
    return mapping.map(([coordinateX, coordinateY]) => [coordinateX * scale, coordinateY * scale]);
  } else {
    return transformMapping(mapping, scale);
  }
};

/**
 * transpose each coordinate in a mapping by an offset.
 * @param {Array} mapping
 * @param {Array} offset
 */
export const transposeMapping = (mapping, offset) => {
  return mapping.map(vector => add(vector, offset));
};

export const rotateMapping = (mapping, angle) => {
  // console.log(`angle ${JSON.stringify(angle)}`);
  const mat = matRotation2D(angle);
  // console.log(`mat ${JSON.stringify(mat)}`);
  return mapping.map(vector => vectorTransform(vector, mat));
};

export const transformPanelMap = (panelMap, { scale = 1, angle = 0, offset = [0, 0] }) => {
  // console.log(`panelMap ${JSON.stringify(panelMap)}`);
  // console.log(`scale ${JSON.stringify(scale)}`);
  // console.log(`angle ${JSON.stringify(angle)}`);
  // console.log(`offset ${JSON.stringify(offset)}`);
  // TODO: compose and map instead
  panelMap = transposeMapping(panelMap, [-0.5, -0.5]);
  panelMap = scaleMapping(panelMap, scale);
  panelMap = rotateMapping(panelMap, angle);
  panelMap = transposeMapping(panelMap, [+0.5, +0.5]);
  panelMap = transposeMapping(panelMap, offset);
  return panelMap;
};

export const generatePanelMaps = (generator, sourceMaps = MAPS_DOME) => {
  // console.log(`generator ${JSON.stringify(generator)}`);
  const maps = {};
  const panels = {};
  Object.entries(generator).forEach(([serverID, serverPanelInfo]) => {
    panels[serverID] = {};
    Object.entries(serverPanelInfo).forEach(([channel, panelInfo]) => {
      if (Object.keys(sourceMaps).indexOf(panelInfo.map) < 0) {
        throw new Error(
          `map name ${panelInfo.map} not in source mappings: ${Object.keys(sourceMaps)}`
        );
      }
      const mapName = `${panelInfo.map}-${serverID}-${channel}`;
      const panelMap = transformPanelMap(sourceMaps[panelInfo.map], panelInfo);
      maps[mapName] = panelMap;
      panels[serverID][channel] = mapName;
    });
  });
  return [maps, panels];
};

export const GLOBAL_SCALE = 0.6;
export const PANEL_0_SKEW = matMult(
  matScale2DY(0.8),
  matRotation2D(-60),
  matScale2D(0.5 * GLOBAL_SCALE)
);
export const PANEL_0_OFFSET = [-0.042 * GLOBAL_SCALE, 0.495 * GLOBAL_SCALE];
export const PANEL_1_SKEW = matMult(matScale2DY(0.95), matScale2D(0.5 * GLOBAL_SCALE));
export const PANEL_1_OFFSET = [0, 0.26 * GLOBAL_SCALE];
export const PANEL_2_SKEW = [[1.1 * GLOBAL_SCALE, 0], [0, 1.1 * GLOBAL_SCALE]];
export const PANEL_2_OFFSET = [0.09 * GLOBAL_SCALE, 0.11 * GLOBAL_SCALE];
export const PANEL_3_SKEW = [[0.4 * GLOBAL_SCALE, 0], [0, 0.4 * GLOBAL_SCALE]];
export const PANEL_3_OFFSET = [0.25 * GLOBAL_SCALE, 0.65 * GLOBAL_SCALE];
export const CTRL_1_ROT = (1 * 360) / 5;
export const CTRL_2_ROT = (2 * 360) / 5;
export const CTRL_3_ROT = (3 * 360) / 5;
export const CTRL_4_ROT = (4 * 360) / 5;
export const CTRL_5_ROT = (0 * 360) / 5;
export const GENERATOR_DOME_OVERHEAD = {
  0: {
    0: {
      map: 'big',
      scale: PANEL_0_SKEW,
      angle: CTRL_1_ROT,
      offset: rotateVector(PANEL_0_OFFSET, CTRL_1_ROT)
    },
    1: {
      map: 'smol',
      scale: PANEL_1_SKEW,
      angle: CTRL_1_ROT,
      offset: rotateVector(PANEL_1_OFFSET, CTRL_1_ROT)
    },
    2: {
      map: 'outer',
      scale: PANEL_2_SKEW,
      angle: CTRL_1_ROT,
      offset: rotateVector(PANEL_2_OFFSET, CTRL_1_ROT)
    }
    // 3: {
    //   map: 'outer_flip',
    //   scale: PANEL_3_SKEW,
    //   angle: CTRL_1_ROT + CTRL_1_ROT,
    //   offset: rotateVector(PANEL_3_OFFSET, CTRL_1_ROT + CTRL_1_ROT)
    // }
  },
  1: {
    0: {
      map: 'big',
      scale: PANEL_0_SKEW,
      angle: CTRL_2_ROT,
      offset: rotateVector(PANEL_0_OFFSET, CTRL_2_ROT)
    },
    1: {
      map: 'smol',
      scale: PANEL_1_SKEW,
      angle: CTRL_2_ROT,
      offset: rotateVector(PANEL_1_OFFSET, CTRL_2_ROT)
    }
    // 2: {
    //   map: 'outer',
    //   scale: PANEL_2_SKEW,
    //   angle: CTRL_2_ROT,
    //   offset: rotateVector(PANEL_2_OFFSET, CTRL_2_ROT)
    // },
    // 3: {
    //   map: 'outer_flip',
    //   scale: PANEL_3_SKEW,
    //   angle: (CTRL_2_ROT + CTRL_1_ROT),
    //   offset: rotateVector(PANEL_3_OFFSET, (CTRL_2_ROT + CTRL_1_ROT))
    // },
  },
  2: {
    0: {
      map: 'big',
      scale: PANEL_0_SKEW,
      angle: CTRL_3_ROT,
      offset: rotateVector(PANEL_0_OFFSET, CTRL_3_ROT)
    },
    1: {
      map: 'smol',
      scale: PANEL_1_SKEW,
      angle: CTRL_3_ROT,
      offset: rotateVector(PANEL_1_OFFSET, CTRL_3_ROT)
    },
    // 2: {
    //   map: 'outer',
    //   scale: PANEL_2_SKEW,
    //   angle: CTRL_3_ROT,
    //   offset: rotateVector(PANEL_2_OFFSET, CTRL_3_ROT)
    // },
    3: {
      map: 'outer_flip',
      scale: PANEL_3_SKEW,
      angle: CTRL_3_ROT + CTRL_1_ROT,
      offset: rotateVector(PANEL_3_OFFSET, CTRL_3_ROT + CTRL_1_ROT)
    }
  },
  3: {
    0: {
      map: 'big',
      scale: PANEL_0_SKEW,
      angle: CTRL_4_ROT,
      offset: rotateVector(PANEL_0_OFFSET, CTRL_4_ROT)
    },
    1: {
      map: 'smol',
      scale: PANEL_1_SKEW,
      angle: CTRL_4_ROT,
      offset: rotateVector(PANEL_1_OFFSET, CTRL_4_ROT)
    },
    2: {
      map: 'outer',
      scale: PANEL_2_SKEW,
      angle: CTRL_4_ROT,
      offset: rotateVector(PANEL_2_OFFSET, CTRL_4_ROT)
    },
    3: {
      map: 'outer_flip',
      scale: PANEL_3_SKEW,
      angle: CTRL_4_ROT + CTRL_1_ROT,
      offset: rotateVector(PANEL_3_OFFSET, CTRL_4_ROT + CTRL_1_ROT)
    }
  },
  4: {
    0: {
      map: 'big',
      scale: PANEL_0_SKEW,
      angle: CTRL_5_ROT,
      offset: rotateVector(PANEL_0_OFFSET, CTRL_5_ROT)
    },
    1: {
      map: 'smol',
      scale: PANEL_1_SKEW,
      angle: CTRL_5_ROT,
      offset: rotateVector(PANEL_1_OFFSET, CTRL_5_ROT)
    },
    2: {
      map: 'outer',
      scale: PANEL_2_SKEW,
      angle: CTRL_5_ROT,
      offset: rotateVector(PANEL_2_OFFSET, CTRL_5_ROT)
    },
    3: {
      map: 'outer_flip',
      scale: PANEL_3_SKEW,
      angle: CTRL_5_ROT + CTRL_1_ROT,
      offset: rotateVector(PANEL_3_OFFSET, CTRL_5_ROT + CTRL_1_ROT)
    }
  }
};

export const [MAPS_DOME_OVERHEAD, PANELS_DOME_OVERHEAD] = generatePanelMaps(
  GENERATOR_DOME_OVERHEAD
);

// export const generateDomeOverhead = () => {
//   // export const [MAPS_DOME_OVERHEAD, PANELS_DOME_OVERHEAD] =
//   return generatePanelMaps(GENERATOR_DOME_OVERHEAD);
// };

import { head, tail, flow } from 'lodash';
import { add, dot, multiply, size } from 'mathjs';

import PIXEL_MAP_DOME_SMOL from './test-data/pixel_map_smol.json';
import PIXEL_MAP_DOME_BIG from './test-data/pixel_map_big.json';
import PIXEL_MAP_DOME_OUTER from './test-data/pixel_map_outer.json';
import PIXEL_MAP_DOME_OUTER_FLIP from './test-data/pixel_map_outer_flip.json';
import PIXEL_MAP_SQUARE_SERP_12 from './test-data/pixel_map_square_serp_12.json';
import PIXEL_MAP_SQUARE_SERP_9 from './test-data/pixel_map_square_serp_9.json';

export {
  PIXEL_MAP_DOME_SMOL,
  PIXEL_MAP_DOME_BIG,
  PIXEL_MAP_DOME_OUTER,
  PIXEL_MAP_DOME_OUTER_FLIP,
  PIXEL_MAP_SQUARE_SERP_12,
  PIXEL_MAP_SQUARE_SERP_9
};

// export const isCloseTo = (value, target, epsilon = 0.01) => {
//   return Math.abs(value - target) < epsilon;
// };

// Return a normalized copy of `pixel map` all x, y between 0, 1.
export const normalizePixMap = pixMap => {
  if (size(pixMap)[1] !== 2) {
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

  return pixMap.map(([x, y]) => [(x - pixMinX) / pixBreadthMax, (y - pixMinY) / pixBreadthMax]);
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

export const MAPS_SQUARE_SERP_12 = {
  square: normalizePixMap(PIXEL_MAP_SQUARE_SERP_12)
};

export const PANELS_SQUARE_SERP_12 = {
  4: { 0: 'square' }
};

export const MAPS_SQUARE_SERP_9 = {
  square: normalizePixMap(PIXEL_MAP_SQUARE_SERP_9)
};

export const PANELS_SQUARE_SERP_9 = {
  4: { 0: 'square' }
};

/**
 * Convert from radians to degrees
 * @param {Number} angle Angle in radians
 */
export const degreesToRadians = angle => (angle * Math.PI) / 180;

/**
 * Generate a rotation matrix from the angle in degrees.
 * @param {Number} angle (degrees)
 */
export const matRotation2D = angle => {
  const theta = degreesToRadians(angle);
  const [valCos, valSin] = [Math.cos(theta), Math.sin(theta)];
  return [[valCos, -valSin], [valSin, valCos]];
};

/**
 * Generate a scale matrix from the scalar.
 * @param {Number} scalar The scale amount.
 */
export const matScale2D = scalar => [[scalar, 0], [0, scalar]];

/**
 * Generate a scale matrix in the y direction from the scalar
 * @param {Number} scalar
 */
export const matScale2DY = scalar => [[1, 0], [0, scalar]];

export const matMult = (...matrices) =>
  tail(matrices).reduce((result, matrix) => multiply(result, matrix), head(matrices));

/**
 * Transform a vector using a transformation matrix
 * @param {Array} vector
 * @param {Array} matrix transformation matrix
 */
export const vectorTransform = (vector, matrix) =>
  matrix.map(row => {
    try {
      return dot(row, vector);
    } catch (err) {
      throw new Error(
        `err ${err} vector ${JSON.stringify(vector)} matrix ${JSON.stringify(matrix)}`
      );
    }
  });

/**
 * Rotate a 2D vector by a given angle
 * @param {Array} vector
 * @param {Number} angle in degrees
 */
export const rotateVector = (vector, angle) => vectorTransform(vector, matRotation2D(angle));

/**
 * Transform each coordinate in a mapping by a matrix
 * @param {Array} mat the transformation matrix
 */
export const transformMapper = mat => vector => vectorTransform(vector, mat);

/**
 * Scale each coordinate in a mapping by a scalar
 * @param {Number} scale
 */
export const scaleMapper = scale => ([xCoordinate, yCoordinate]) => [
  xCoordinate * scale,
  yCoordinate * scale
];

/**
 * Select which mapper to use based off scale
 * @param {Number | Array} scale
 */
export const scaleOrTransformSelector = scale =>
  typeof scale === 'number' ? scaleMapper(scale) : transformMapper(scale);

/**
 * transpose each coordinate in a mapping by an offset.
 * @param {Array} offset
 */
export const transposeMapper = offset => vector => add(vector, offset);

export const rotateMapper = angle => vector => vectorTransform(vector, matRotation2D(angle));

export const transformPanelMap = (panelMap, { scale = 1, angle = 0, offset = [0, 0] }) =>
  panelMap.map(
    flow(
      transposeMapper([-0.5, -0.5]),
      scaleOrTransformSelector(scale),
      rotateMapper(angle),
      transposeMapper([+0.5, +0.5]),
      transposeMapper(offset)
    )
  );

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
      maps[mapName] = transformPanelMap(sourceMaps[panelInfo.map], panelInfo);
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
